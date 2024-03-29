import Button from '../components/button/button';
import './garage.scss';
import AsyncAPI from '../async-api/async-api';
import Util from '../util/util';

interface Car {
  name: string;
  color: string;
  id: number;
}

interface CarInput {
  name: string;
  color: string;
}

interface CarWithSpeed {
  animation: number;
  id: number;
}

interface Winner {
  id: number;
  wins: number;
  time: number;
}

const MAX_CARS_ON_PAGE = 7;
const GENERATE_CARS = 100;

class Garage {
  private garageScreen: HTMLDivElement;

  private header: HTMLElement;

  private main: HTMLElement;

  private nav: HTMLElement;

  private controlPanel: HTMLDivElement;

  private garagePages: HTMLDivElement;

  private winnerMgs: HTMLParagraphElement;

  public winner: Winner;

  private carsArr: Car[];

  private asyncApi: AsyncAPI;

  private util: Util;

  private lastPage: HTMLDivElement | null;

  private lastPageId: number;

  private totalCars: number;

  private selectedCar: number;

  constructor() {
    this.garageScreen = document.createElement('div');
    this.header = document.createElement('header');
    this.main = document.createElement('main');
    this.nav = document.createElement('nav');
    this.controlPanel = document.createElement('div');
    this.garagePages = document.createElement('div');
    this.winnerMgs = document.createElement('p');
    this.carsArr = [];
    this.asyncApi = new AsyncAPI();
    this.lastPage = null;
    this.lastPageId = 1;
    this.totalCars = 0;
    this.selectedCar = 0;
    this.util = new Util();
    this.winner = { id: -1, wins: 0, time: -1 };
  }

  public create(): HTMLDivElement {
    this.garageScreen.classList.add('garage-screen');
    this.header.classList.add('header');
    this.main.classList.add('main');
    this.nav.classList.add('nav');
    this.controlPanel.classList.add('control-panel');
    this.garagePages.classList.add('garage');
    this.garagePages.addEventListener('click', this.whichButton.bind(this));
    this.winnerMgs.classList.add('winner-msg');

    const toGarageBtn = new Button('nav__garage').createButton('To Garage');
    const toWinnersBtn = new Button('nav__winners').createButton('To Winners');

    toGarageBtn.addEventListener('click', () => Garage.toGarage());
    toWinnersBtn.addEventListener('click', () => Garage.toWinners());

    this.feedControlPanel();
    this.feedGarage();

    this.nav.append(toGarageBtn);
    this.nav.append(toWinnersBtn);

    this.header.append(this.nav);

    this.main.append(this.controlPanel);
    this.main.append(this.garagePages);

    this.garageScreen.append(this.header);
    this.garageScreen.append(this.main);
    this.garageScreen.append(this.winnerMgs);
    return this.garageScreen;
  }

  private feedControlPanel() {
    const createBlock = document.createElement('div');
    createBlock.classList.add('control-panel-create');

    const createName = document.createElement('input');
    createName.classList.add('control-panel-create__name');
    createName.type = 'text';

    const createColorBtn = document.createElement('input');
    createColorBtn.classList.add('control-panel-create__color');
    createColorBtn.type = 'color';
    createColorBtn.value = '#ffffff';

    const createCarBtn = new Button('control-panel-create__crt').createButton('Create');
    // createName это ссылка на объект в DOM, его не нужно снова получать внутри хэндлера!
    // TODO переделать
    createCarBtn.addEventListener('click', () =>
      this.createCar({ name: createName.value, color: createColorBtn.value }, createName, createColorBtn),
    );

    const updateBlock = document.createElement('div');
    updateBlock.classList.add('control-panel-update');

    const updateName = document.createElement('input');
    updateName.classList.add('control-panel-update__name');
    updateName.type = 'text';

    const updateColorBtn = document.createElement('input');
    updateColorBtn.classList.add('control-panel-update__color');
    updateColorBtn.type = 'color';
    updateColorBtn.value = '#ffffff';

    const updateCarBtn = new Button('control-panel-update__upt').createButton('Update');
    // TODO переделать
    updateCarBtn.addEventListener('click', () =>
      this.updateCar(
        { name: updateName.value, color: updateColorBtn.value, id: this.selectedCar },
        updateName,
        updateColorBtn,
        updateCarBtn,
      ),
    );

    updateName.classList.add('control-panel-update__name_disabled');
    updateColorBtn.classList.add('control-panel-update__color_disabled');
    updateCarBtn.classList.add('control-panel-update__upt_disabled');

    const functionalBlock = document.createElement('div');
    functionalBlock.classList.add('control-panel-functional');

    const raceBtn = new Button('control-panel-functional__race').createButton('Race');
    const resetBtn = new Button('control-panel-functional__reset').createButton('Reset');
    const generateBtn = new Button('control-panel-functional__generate').createButton('Generate Cars');
    raceBtn.addEventListener('click', this.race.bind(this));
    resetBtn.addEventListener('click', this.reset.bind(this));
    generateBtn.addEventListener('click', () => this.generateCars(createCarBtn, createName, createColorBtn));
    resetBtn.classList.add('control-panel-functional__reset_disabled');

    createBlock.append(createName);
    createBlock.append(createColorBtn);
    createBlock.append(createCarBtn);
    this.controlPanel.append(createBlock);

    updateBlock.append(updateName);
    updateBlock.append(updateColorBtn);
    updateBlock.append(updateCarBtn);
    this.controlPanel.append(updateBlock);

    functionalBlock.append(raceBtn);
    functionalBlock.append(resetBtn);
    functionalBlock.append(generateBtn);
    this.controlPanel.append(functionalBlock);
  }

  private feedGarage() {
    const garageTitle = document.createElement('h2');
    garageTitle.classList.add('garage__title');
    garageTitle.append(`Garage (${4})`);

    const garageControls = document.createElement('div');
    garageControls.classList.add('garage-controls');

    const prevPageBtn = new Button('garage-controls__prev').createButton('<-');
    const nextPageBtn = new Button('garage-controls__next').createButton('->');
    // TODO переделать
    prevPageBtn.addEventListener('click', () => this.movePage(false));
    nextPageBtn.addEventListener('click', () => this.movePage(true));

    garageControls.append(prevPageBtn);
    garageControls.append(nextPageBtn);

    this.garagePages.append(garageTitle);
    this.garagePages.append(garageControls);

    this.addPage();

    const defaultPage = this.garagePages.querySelector('.garage-page');
    if (defaultPage) defaultPage.classList.add('garage-page_show');
    this.addDefaultCars();
  }

  private addPage() {
    const garagePage = document.createElement('div');
    garagePage.classList.add('garage-page');
    garagePage.id = `gPage-${this.lastPageId}`;

    const garagePageTitle = document.createElement('h3');
    garagePageTitle.classList.add('garage-page__title');
    garagePageTitle.append(`Page #${this.lastPageId}`);

    const cars = document.createElement('div');
    cars.classList.add('garage-page__cars');

    garagePage.append(garagePageTitle);
    garagePage.append(cars);

    this.lastPageId += 1;
    this.lastPage = cars;

    this.garagePages.append(garagePage);
  }

  private movePage(sign: boolean): void {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (currentPage) {
      const currentPageId = currentPage.id;
      const [idName, idNumber] = currentPageId.split('-');
      const newPageId = sign ? Number(idNumber) + 1 : Number(idNumber) - 1;
      const newPage = document.getElementById(`${idName}-${newPageId}`);
      if (newPage) {
        currentPage.classList.remove('garage-page_show');
        newPage.classList.add('garage-page_show');
      }
    }
  }

  private async addDefaultCars() {
    this.carsArr = await this.asyncApi.getCars();

    this.carsArr.forEach((el) => {
      if (this.lastPage) {
        this.totalCars += 1;
        const title = this.garagePages.querySelector('.garage__title');
        if (title) title.textContent = `Garage (${this.totalCars})`;

        if (this.lastPage.children.length < MAX_CARS_ON_PAGE) {
          Garage.addCar(el, this.lastPage);
        } else {
          this.addPage();
          Garage.addCar(el, this.lastPage);
        }
      }
    });
    this.carsArr.length = 0;
  }

  private static addCar(el: Car, page: HTMLDivElement) {
    const car = document.createElement('div');
    car.classList.add('car');
    car.id = String(el.id);

    const carControls = document.createElement('div');
    carControls.classList.add('car-controls');

    const selectCarBtn = new Button('car-controls__select').createButton('Select');
    const removeCarBtn = new Button('car-controls__remove').createButton('Remove');

    const carName = document.createElement('p');
    carName.classList.add('car-controls__name');
    carName.append(el.name);

    const track = document.createElement('div');
    track.classList.add('track');

    const startBtn = new Button('track__start').createButton('S');
    const restartBtn = new Button('track__restart').createButton('R');
    restartBtn.classList.add('track__restart_disabled');

    const finishImg = document.createElement('div');
    finishImg.classList.add('track__finish');

    track.append(startBtn);
    track.append(restartBtn);
    track.append(Garage.setCarImg(el.color));
    track.append(finishImg);

    carControls.append(selectCarBtn);
    carControls.append(removeCarBtn);
    carControls.append(carName);

    car.append(carControls);
    car.append(track);

    page.append(car);
  }

  private static setCarImg(carColor: string): SVGSVGElement {
    const carImg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    carImg.classList.add('track__car-img');
    carImg.setAttributeNS(null, 'viewBox', `0 0 1280 640`);
    carImg.setAttributeNS(null, 'width', `1706.667`);
    carImg.setAttributeNS(null, 'height', `853.333`);
    carImg.setAttributeNS(null, 'fill', carColor);

    const paths = [
      'M356.5 106.4c-10.6 3-10.1 2.6-10.8 11.1-.4 4.2-.9 8-1.2 8.5-.6 1-24.6 10.5-59 23.4-44.8 16.7-105.2 41.5-117.3 48.3-7.8 4.3-19.3 9.1-25 10.4-2.3.5-9.8 1.4-16.5 1.9-6.7.6-16.7 1.9-22.2 3-15.4 3.1-34 4.9-56.3 5.7l-20.3.6-4.3 6.6c-5.9 9.1-6 9.5-2.6 13 3.7 3.7 3.8 6.5.3 15-2.5 6.2-2.7 7.8-3.1 25.6l-.4 19-3.8 3.2C4.9 309.5.7 322.6.6 343.5c0 19.4 1.1 39.6 2.6 48.2 1.3 7.1 1.4 7.4 7.2 12.2 6.9 5.8 13 12.9 15.8 18.4 6.4 12.6 53.4 21.1 138.4 25l9.2.4-.6-11.9c-.6-14.2.8-25.6 4.9-38.3 11.2-35.2 39.4-62.2 75.6-72.2 9-2.6 11.2-2.8 27.8-2.8 16.5 0 18.8.2 27.8 2.7 20.1 5.6 36.1 15.2 50.4 30.2 14 14.5 22.2 29.3 27.4 49.2 2.1 7.9 2.4 10.9 2.3 27.9-.1 12.7-.6 21.4-1.6 26.3l-1.5 7.3 300.6-.7c165.3-.4 300.7-.8 300.9-.9.1-.1-.8-3.7-2-8.1-1.9-6.7-2.2-10.5-2.2-25.9-.1-16.6.1-18.7 2.7-27.9 11.7-42.1 46.7-73.6 88.5-79.7 11.9-1.7 32.5-.7 43.2 2.1 23.9 6.3 45.3 20.5 60.1 39.9 7 9.2 15.4 26.7 18.5 38.6 2.4 8.8 2.7 11.9 2.7 26 .1 11.6-.4 18.1-1.6 23.4-1 4.1-1.6 7.5-1.5 7.6.2.1 6.2-.2 13.3-.6 26.6-1.6 45.8-4.5 52.5-7.9 4.8-2.4 9.7-8.1 12.7-14.6l2.4-5.2-1.6-15.7c-1.5-15.2-1.5-16.3.4-28.4 6.3-38.8 5-68-3.5-80.2-13.4-19.3-52.6-33.6-142.9-51.9-73.7-14.9-132.2-20.9-203.3-21-22.8 0-22.6 0-34.7-8.5-18.7-13.1-104.5-60.7-147.1-81.5-38.3-18.7-78.8-28.1-143.9-33.2-20.8-1.7-110.6-1.6-140 0-12.1.7-31.4 1.9-43 2.7-30.2 2.2-28.6 2.2-34.1-1-14-8.1-18.7-9.4-26.9-7.1zM545 139.7c.6 3.7 3.8 23.8 7.1 44.6 3.2 20.9 6.6 42.2 7.5 47.4.9 5.2 1.5 9.6 1.3 9.7-1.1.9-169.9-2.9-195.1-4.4-20.6-1.3-41.7-3.6-48.5-5.4-9.8-2.6-19.8-11.9-24.9-23.1-3.5-7.5-3.6-17.2-.5-25.5 1.7-4.5 3-6.1 6.8-8.6 8.3-5.4 13.5-8 25.3-12.7 34.1-13.6 85.8-23 146-26.7 26.9-1.6 27-1.6 51.1-1.8l22.7-.2 1.2 6.7zm63-4.7c26.4 1.8 77.7 11 102.9 18.6 18.6 5.6 44.5 18.8 75.6 38.7 21.1 13.4 27.4 18.1 25 18.5-7.5 1.2-13.3 5-16.2 10.6-1.9 3.5-2.1 13.6-.4 17.9l1.1 2.7-90.7-.2-90.6-.3-5.9-16c-11-30.2-29.8-87.8-29.8-91.6 0-.6 9.5-.2 29 1.1z',
      'M263.3 327.5c-22.3 4-41 14.1-56.8 30.6-13.2 13.8-21.3 28.3-26.2 46.7-2.2 8.3-2.6 11.9-2.6 24.7-.1 16.9 1 23.6 6.5 38.2 8.7 23 27.1 43.6 49.3 55.1 8.5 4.4 17.8 7.8 27.1 9.8 10.7 2.3 31.2 2.3 41.9-.1 39.2-8.4 69.9-37.5 80.2-76.1 2.3-8.6 2.6-12 2.7-25.4.1-15.8-.5-19.9-4.6-33-9.8-31-35.5-56.7-66.8-66.9-15-5-35.4-6.4-50.7-3.6zm35 30.1c24.9 5.6 45.7 24.7 54.3 49.9 2.5 7.2 2.8 9.5 2.8 22 .1 15.3-1.5 22.8-7.4 34.5-9.4 18.6-28.3 33.7-48.5 38.6-9.6 2.4-26.8 2.4-36 0-32-8.4-54.4-35.5-56.2-68.1-2-35.9 20.9-67.3 55.8-76.5 9.4-2.4 25.3-2.6 35.2-.4z',
      'M260 370.3c-3.6 1.3-8.5 3.6-10.9 5.1l-4.4 2.8 11.6 11.5c8.1 8.2 12 11.4 13.1 11 1.4-.6 1.6-2.9 1.6-16.7 0-18.6.6-17.8-11-13.7zM292 383.9c0 13.9.2 16.2 1.6 16.8 1.1.4 5-2.8 13-10.8l11.5-11.4-2.8-2.2c-3.4-2.8-13.8-7-19.3-7.9l-4-.7v16.2zM228.2 395.2c-2.8 3.6-9.2 19.1-9.2 22.5 0 1 3.4 1.3 16.5 1.3 15.1 0 16.5-.1 16.5-1.8 0-1.5-20.6-23.2-22.1-23.2-.4 0-1.1.6-1.7 1.2zM322.2 404.9c-6.2 5.9-11.2 11.5-11.2 12.4 0 1.5 1.7 1.7 16.5 1.7 13.1 0 16.5-.3 16.5-1.3 0-4-6.9-20.5-9.5-22.7-.7-.6-4.8 2.7-12.3 9.9zM278.1 406.8c-1.2 2.2 1.1 6.2 3.4 6.2.8 0 2.1-1 2.9-2.2 2-2.8.4-5.8-2.9-5.8-1.3 0-2.9.8-3.4 1.8zM274.9 423.9c-3.2 3.3-3.7 6.7-1.4 11 2.9 5.7 10.4 6.4 15.1 1.4 5.3-5.7.9-15.3-7.1-15.3-2.7 0-4.4.8-6.6 2.9zM257 427.5c-2.6 3.2 1.3 8.1 4.8 5.9 2.4-1.6 2.7-4.5.6-6.1-2.3-1.7-3.9-1.6-5.4.2zM300.6 427.6c-2 1.9-2 3.8-.2 5.4 2.3 1.9 6.1.8 6.4-1.8.7-4.4-3.2-6.7-6.2-3.6zM219 442.5c0 2.9 4.1 14 7.2 19.4l3.1 5.3 11.7-11.7c7.1-7.1 11.6-12.3 11.3-13.1-.4-1.1-4-1.4-16.9-1.4-14.1 0-16.4.2-16.4 1.5zM311 442.8c0 .9 5.1 6.8 11.4 13.1l11.4 11.4 3.1-5.4c3-5.1 7.1-16.5 7.1-19.5 0-1.1-3.1-1.4-16.5-1.4-15.1 0-16.5.1-16.5 1.8zM278 449.9c-.7 1.5-.5 2.4.8 4.1 3.2 4 8.5.4 6.2-4.1-1.4-2.5-5.6-2.5-7 0zM256.2 470.3c-6.1 6.2-11.2 11.5-11.2 11.9 0 1.8 20.8 10.8 24.9 10.8.7 0 1.1-5.4 1.1-16.4 0-14-.2-16.5-1.6-17-.9-.3-1.6-.6-1.7-.6-.1 0-5.3 5.1-11.5 11.3zM293.3 459.7c-1.5.6-1.9 33.3-.4 33.3 4.6 0 25.1-8.8 25.1-10.8 0-.9-22.3-23.2-23-23.1-.3 0-1.1.3-1.7.6zM1070 328.1c-39 8.4-69.6 37.6-79.7 75.9-3.1 11.7-4.1 29.2-2.4 41.1 3.3 22.7 15 45.3 31.8 60.9 26.7 25 64.3 34.4 99.3 24.9 11.7-3.2 28.3-11.8 38-19.6 48.7-39.6 51.8-112.8 6.7-156-9.7-9.3-16.6-14-29-19.8-13.7-6.4-23.5-8.6-40.7-9.1-12-.3-16.2 0-24 1.7zm44.5 31.3c23.8 8.1 40.9 25.8 48.6 50.6 3 9.6 3.3 28.9.5 38.8-11 40-51.3 63.7-91.1 53.6-14.9-3.8-31.3-14.7-40.2-26.7-17.6-23.8-20.3-53.3-7.1-79.7 3.4-6.9 6-10.3 13.8-18 7.7-7.8 11.1-10.4 18.1-13.9 12.9-6.5 20.7-8.1 36.4-7.7 10.9.3 14.3.7 21 3z',
      'M1070.3 370c-5.4 1.9-15.3 7.1-15.3 8 0 .3 5.1 5.7 11.4 11.9 8 8 11.9 11.2 13 10.8 1.4-.5 1.6-2.9 1.6-16.7v-16l-2.7.1c-1.6 0-5.2.9-8 1.9zM1102 383.9c0 13.9.2 16.2 1.6 16.8 2.2.8 24.7-21.6 23.4-23.2-1.7-2-16.3-8.4-20.7-9.1l-4.3-.7v16.2zM1036.6 397.6c-2.9 4.4-7.6 16.5-7.6 19.4 0 1.9.7 2 16.5 2 12.6 0 16.5-.3 16.5-1.3 0-.7-5.1-6.3-11.4-12.6l-11.4-11.4-2.6 3.9zM1131.3 405.2c-6.1 6.2-10.9 11.9-10.6 12.5.6 1.5 33.3 1.9 33.3.4 0-4.5-8.8-24.1-10.8-24.1-.4 0-5.7 5.1-11.9 11.2zM1088.2 406.2c-1.7 1.7-1.5 3.2.7 5.2 1.6 1.4 2.3 1.5 4.1.6 3.1-1.7 2.4-6.4-1-6.8-1.4-.2-3.1.3-3.8 1zM1084.6 424.1c-6.8 8.1 1.7 19.4 11 14.4 8.9-4.8 5.6-17.5-4.6-17.5-3 0-4.4.6-6.4 3.1zM1067 427.4c-1.9 2.3-.8 6.1 1.8 6.4 4.4.7 6.7-3.2 3.6-6.2-1.9-2-3.8-2-5.4-.2zM1110.6 427.3c-2.1 1.6-1.8 4.5.7 6.1 3.7 2.3 7.7-3.5 4.1-6.1-1-.7-2.1-1.3-2.4-1.3-.3 0-1.4.6-2.4 1.3zM1029 443c0 2.9 4.3 14.1 7.4 19.5l2.8 4.8 11.6-11.6c8.1-8.1 11.3-12 10.9-13.1-.6-1.4-2.9-1.6-16.7-1.6-15.2 0-16 .1-16 2zM1120.7 442.2c-.3.7 4.7 6.6 11.1 13l11.6 11.8 2.7-4.3c2.7-4.4 7.9-17.7 7.9-20.3 0-1.2-2.8-1.4-16.4-1.4-12.2 0-16.6.3-16.9 1.2zM1088.1 449.9c-1.4 2.5-.5 4.8 2 5.6 2.7.9 5.1-1.3 4.7-4.4-.4-3.4-5.1-4.3-6.7-1.2zM1066.2 470.3c-6.1 6.2-11.2 11.5-11.2 11.9 0 2 20.1 10.8 24.7 10.8 1 0 1.3-3.4 1.3-16.4 0-14-.2-16.5-1.6-17-.9-.3-1.6-.6-1.7-.6-.1 0-5.3 5.1-11.5 11.3zM1103.3 459.7c-1 .3-1.3 4.7-1.3 16.9 0 9 .4 16.4.8 16.4 3.6 0 18.6-6.1 23.9-9.8 1.6-1-21.6-24.2-23.4-23.5z',
    ];

    paths.forEach((el) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'd', el);
      carImg.append(path);
    });

    return carImg;
  }

  private async createCar(car: CarInput, createName: HTMLInputElement, createColorBtn: HTMLInputElement) {
    const newAsyncCar = await this.asyncApi.createCar(car);
    if (newAsyncCar.isCreated) {
      const carName = createName;
      const carColor = createColorBtn;
      carName.value = '';
      carColor.value = '#ffffff';

      const currentPage = this.garagePages.querySelector('.garage-page_show');
      if (!currentPage) throw new Error('There is no current page');
      const carsOnCurrentPage = currentPage.querySelector('.garage-page__cars');
      if (!(carsOnCurrentPage instanceof HTMLDivElement)) throw new Error('There is no cars on current page');

      const allCarsOnAllPages: HTMLDivElement[] = [];
      this.garagePages.querySelectorAll('.garage-page').forEach((el) => {
        const carsOnPage = el.querySelector('.garage-page__cars');
        if (carsOnPage instanceof HTMLDivElement) allCarsOnAllPages.push(carsOnPage);
      });
      let areFullofCars = true;

      const newCar: Car = { name: car.name, color: car.color, id: newAsyncCar.carId };
      this.totalCars += 1;
      const title = this.garagePages.querySelector('.garage__title');

      if (title) title.textContent = `Garage (${this.totalCars})`;

      // добавляем машину на текущую страницу
      // если фулл, то по остатками на других
      // если фулл, то на новую страницу
      // можно добавлять просто в конец и убрать кучу кода = незнаю
      if (carsOnCurrentPage.children.length < MAX_CARS_ON_PAGE) Garage.addCar(newCar, carsOnCurrentPage);
      else {
        allCarsOnAllPages.every((el) => {
          if (el.children.length < MAX_CARS_ON_PAGE) {
            Garage.addCar(newCar, el);
            areFullofCars = false;
            return areFullofCars;
          }
          return areFullofCars;
        });
        if (areFullofCars) {
          this.addPage();
          if (this.lastPage) Garage.addCar(newCar, this.lastPage);
        }
      }
    }
    // TODO Update pageView
  }

  private async generateCars(
    createCarBtn: HTMLButtonElement,
    createName: HTMLInputElement,
    createColorBtn: HTMLInputElement,
  ) {
    const carName = createName;
    const carColor = createColorBtn;

    this.carsArr = Array.from({ length: GENERATE_CARS }, () => {
      return { name: this.util.getRandomName(), color: this.util.getRandomColor(), id: 0 };
    });

    this.carsArr.forEach((el) => {
      carName.value = el.name;
      carColor.value = el.color;
      createCarBtn.dispatchEvent(new Event('click'));
    });

    carName.value = '';
    carColor.value = '#ffffff';
    // this.carsArr.forEach((car) => this.asyncApi.createCar(car));
  }

  private async updateCar(
    car: Car,
    updateName: HTMLInputElement,
    updateColorBtn: HTMLInputElement,
    updateCarBtn: HTMLButtonElement,
  ) {
    if (await this.asyncApi.updateCar(car)) {
      const carName = updateName;
      const carColor = updateColorBtn;
      carName.value = '';
      carColor.value = '#ffffff';
      this.selectedCar = 0;

      updateName.classList.add('control-panel-update__name_disabled');
      updateColorBtn.classList.add('control-panel-update__color_disabled');
      updateCarBtn.classList.add('control-panel-update__upt_disabled');

      const carObjectInDOM = document.getElementById(`${car.id}`);
      if (carObjectInDOM) {
        const carNameInDOM = carObjectInDOM.querySelector('.car-controls__name');
        if (carNameInDOM) carNameInDOM.textContent = car.name;

        const carImgInDOM = carObjectInDOM.querySelector('.track__car-img');
        if (carImgInDOM) carImgInDOM.setAttributeNS(null, 'fill', car.color);
      }
    }
  }

  private whichButton(event: MouseEvent): void {
    const { target } = event;

    if (!(target instanceof HTMLButtonElement)) return;

    // TODO не по textContent
    switch (target.textContent) {
      case 'Remove':
        this.removeCar(target);
        break;
      case 'Select':
        this.selectCar(target);
        break;
      case 'S':
        this.driveCar(target);
        break;
      case 'R':
        this.resetCar(target);
        break;
      default:
    }
  }

  private async removeCar(removeButton: HTMLButtonElement) {
    const parent = removeButton.parentElement;
    if (!parent) return;

    const currentCar = parent.parentElement;
    if (!currentCar) return;

    if (await this.asyncApi.deleteCar(currentCar.id)) {
      this.totalCars -= 1;
      const title = this.garagePages.querySelector('.garage__title');
      if (title) title.textContent = `Garage (${this.totalCars})`;
      currentCar.remove();

      if (Number(currentCar.id) === this.selectedCar) {
        this.selectedCar = 0;
        const inputCarName = this.controlPanel.querySelector('.control-panel-update__name');
        const inputCarColor = this.controlPanel.querySelector('.control-panel-update__color');
        const buttonUpdateCar = this.controlPanel.querySelector('.control-panel-update__upt');
        if (
          inputCarName instanceof HTMLInputElement &&
          inputCarColor instanceof HTMLInputElement &&
          buttonUpdateCar instanceof HTMLButtonElement
        ) {
          inputCarName.classList.add('control-panel-update__name_disabled');
          inputCarColor.classList.add('control-panel-update__color_disabled');
          buttonUpdateCar.classList.add('control-panel-update__upt_disabled');

          inputCarName.value = '';
          inputCarColor.value = '#ffffff';
        }
      }
    }

    // TODO update pageView
  }

  private async selectCar(selectButton: HTMLButtonElement) {
    const parent = selectButton.parentElement;
    if (!parent) return;

    const currentCar = parent.parentElement;
    if (!currentCar) return;

    this.selectedCar = Number(currentCar.id);
    const car = await this.asyncApi.getCar(currentCar.id);
    const inputCarName = this.controlPanel.querySelector('.control-panel-update__name');
    const inputCarColor = this.controlPanel.querySelector('.control-panel-update__color');
    const buttonUpdateCar = this.controlPanel.querySelector('.control-panel-update__upt');
    if (
      inputCarName instanceof HTMLInputElement &&
      inputCarColor instanceof HTMLInputElement &&
      buttonUpdateCar instanceof HTMLButtonElement
    ) {
      inputCarName.classList.remove('control-panel-update__name_disabled');
      inputCarColor.classList.remove('control-panel-update__color_disabled');
      buttonUpdateCar.classList.remove('control-panel-update__upt_disabled');

      inputCarName.value = car.name;
      inputCarColor.value = car.color;
    }
  }

  private AreAllStartButtonsOn(): boolean {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (!currentPage) return false;

    return !currentPage.querySelector('.track__start_disabled');
  }

  private AreAllRestartButtonsOn(): boolean {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (!currentPage) return false;

    return !currentPage.querySelector('.track__restart_disabled');
  }

  private AreAllRestartButtonsOff(): boolean {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (!currentPage) return false;

    const carsRestartButtons = Array.from(currentPage.querySelectorAll('.track__restart'));

    return (
      carsRestartButtons.length ===
      carsRestartButtons.filter((el) => el.classList.contains('track__restart_disabled')).length
    );
  }

  private PaginationButtonsStateChanger(turnOn: boolean): void {
    const prevPageBtn = this.garagePages.querySelector('.garage-controls__prev');
    const nextPageBtn = this.garagePages.querySelector('.garage-controls__next');
    if (!prevPageBtn) return;
    if (!nextPageBtn) return;
    if (turnOn) {
      prevPageBtn.classList.remove('garage-controls__prev_disabled');
      nextPageBtn.classList.remove('garage-controls__next_disabled');
    } else {
      prevPageBtn.classList.add('garage-controls__prev_disabled');
      nextPageBtn.classList.add('garage-controls__next_disabled');
    }
  }

  private async driveCar(startButton: HTMLButtonElement) {
    this.PaginationButtonsStateChanger(false);

    const returnvalue: CarWithSpeed = { animation: -1, id: -1 };

    const parent = startButton.parentElement;
    if (!parent) return returnvalue;

    startButton.classList.add('track__start_disabled');
    const raceButton = document.querySelector('.control-panel-functional__race');
    if (raceButton) raceButton.classList.add('control-panel-functional__race_disabled');

    const currentCar = parent.parentElement;
    if (!currentCar) return returnvalue;

    const animationTime = await this.asyncApi.startEngine(currentCar.id);

    document.documentElement.style.setProperty('--track-width', `${parent.clientWidth}px`);

    const carImg = parent.querySelector('.track__car-img');
    if (!(carImg instanceof SVGSVGElement)) return returnvalue;

    carImg.style.animationDuration = `${animationTime}ms`;

    carImg.classList.add('car-drive');
    carImg.classList.add('car-finished');
    const restartBtn = parent.querySelector('.track__restart');
    if (restartBtn) restartBtn.classList.remove('track__restart_disabled');

    /*     const resetButton = document.querySelector('.control-panel-functional__reset');
    if (resetButton) resetButton.classList.remove('control-panel-functional__reset_disabled'); */

    if (this.AreAllRestartButtonsOn()) {
      const resetButton = document.querySelector('.control-panel-functional__reset');
      if (resetButton) resetButton.classList.remove('control-panel-functional__reset_disabled');
    }

    try {
      const isFinished = await this.asyncApi.driveCar(currentCar.id);

      if (!isFinished) {
        carImg.classList.add('stop-car');
        carImg.classList.add('track__car-img_fire');
      } else {
        // carImg.classList.add('car-finished');
        returnvalue.animation = animationTime;
        returnvalue.id = Number(currentCar.id);
        /*       carImg.style.animationDuration = `${(animationTime / (parent.clientWidth - 414)) * 184}ms`;
          carImg.classList.add('car-to-finish');
          carImg.classList.add('car-on-finish'); */
      }
      this.asyncApi.aborted = this.asyncApi.aborted.filter((el) => el.carId !== Number(currentCar.id));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError')
        this.asyncApi.aborted = this.asyncApi.aborted.filter((el) => el.carId !== Number(currentCar.id));
    }
    return returnvalue;
  }

  private async resetCar(resetButton: HTMLButtonElement) {
    const parent = resetButton.parentElement;
    resetButton.classList.add('track__restart_disabled');
    if (this.AreAllRestartButtonsOff()) {
      const resetAllBtn = document.querySelector('.control-panel-functional__reset');
      if (resetAllBtn) resetAllBtn.classList.add('control-panel-functional__reset_disabled');
    }
    if (!parent) return;

    const currentCar = parent.parentElement;
    if (!currentCar) return;

    const carImg = parent.querySelector('.track__car-img');
    if (!(carImg instanceof SVGSVGElement)) return;

    if (await this.asyncApi.stopEngine(currentCar.id)) {
      const index = this.asyncApi.aborted.map((el) => el.carId).indexOf(Number(currentCar.id));
      const requestToAbort = this.asyncApi.aborted[index];
      if (requestToAbort) requestToAbort.controller.abort();
      carImg.classList.add('stop-car');
      carImg.classList.remove('car-finished');
      carImg.classList.remove('car-drive');
      carImg.classList.remove('track__car-img_fire');
      carImg.classList.remove('stop-car');
      const startButton = parent.querySelector('.track__start');
      if (startButton) startButton.classList.remove('track__start_disabled');
      if (this.AreAllStartButtonsOn()) {
        const raceButton = document.querySelector('.control-panel-functional__race');
        if (raceButton) raceButton.classList.remove('control-panel-functional__race_disabled');
        this.PaginationButtonsStateChanger(true);
      }
    }
  }

  private async race() {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (!currentPage) return;

    const cars = currentPage.querySelector('.garage-page__cars');
    if (!cars) return;

    const carsStartButtons: NodeListOf<HTMLButtonElement> = currentPage.querySelectorAll('.track__start');

    const promises: Promise<CarWithSpeed>[] = [];

    carsStartButtons.forEach((el) => {
      promises.push(this.driveCar(el));
    });

    const results = await Promise.allSettled(promises);

    const winner = results
      .filter(
        (el: PromiseSettledResult<CarWithSpeed>): el is PromiseFulfilledResult<CarWithSpeed> =>
          el.status === 'fulfilled',
      )
      .filter((el) => el.value.animation !== -1)
      .map((el) => el.value)
      .sort((a, b) => a.animation - b.animation)[0];

    if (winner) {
      const winnerCar = document.getElementById(String(winner.id));
      if (!winnerCar) return;
      const carName = winnerCar.querySelector('.car-controls__name');
      if (!carName) return;
      const winnerName = carName.textContent;
      if (winnerName !== null) this.showModalWinner(winnerName, winner.animation, false);
      this.winner = { id: winner.id, wins: 1, time: Math.trunc(winner.animation / 10) / 100 };
      document.body.dispatchEvent(new Event('createWinner'));
    } else this.showModalWinner('', -1, true);
  }

  private showModalWinner(carName: string, time: number, noWinner: boolean) {
    this.winnerMgs.textContent = noWinner
      ? 'All the cars are broken'
      : `${carName} won (${Math.trunc(time / 10) / 100}s)`;
    this.winnerMgs.classList.add('winner-msg_show');
    setTimeout(() => {
      this.winnerMgs.classList.remove('winner-msg_show');
    }, 7000);
  }

  private reset() {
    const currentPage = this.garagePages.querySelector('.garage-page_show');
    if (!currentPage) return;

    const cars = currentPage.querySelector('.garage-page__cars');
    if (!cars) return;

    const carsRestartButtons = Array.from(currentPage.querySelectorAll('.track__restart')).filter(
      (el) => !el.classList.contains('track__restart_disabled'),
    );

    carsRestartButtons.forEach((el) => {
      el.dispatchEvent(new Event('click', { bubbles: true }));
    });
  }

  private static toGarage() {
    const winners = document.querySelector('.winners-screen');
    if (winners) {
      document.body.classList.remove('body_overflow');
      winners.classList.remove('winners-screen_show');
    }
  }

  private static toWinners() {
    const winners = document.querySelector('.winners-screen');
    if (winners) {
      document.body.classList.add('body_overflow');
      winners.classList.add('winners-screen_show');
    }
  }
}

export default Garage;
