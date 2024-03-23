import './garage.scss';
import Button from '../components/button/button';

interface IGarage {
  create(): HTMLDivElement;
}

class Garage implements IGarage {
  private garageScreen: HTMLDivElement;

  private header: HTMLElement;

  private main: HTMLElement;

  private nav: HTMLElement;

  private controlPanel: HTMLDivElement;

  private garagePages: HTMLDivElement;

  constructor() {
    this.garageScreen = document.createElement('div');
    this.header = document.createElement('header');
    this.main = document.createElement('main');
    this.nav = document.createElement('nav');
    this.controlPanel = document.createElement('div');
    this.garagePages = document.createElement('div');
  }

  public create(): HTMLDivElement {
    this.garageScreen.classList.add('garage-screen');
    this.header.classList.add('header');
    this.main.classList.add('main');
    this.nav.classList.add('nav');
    this.controlPanel.classList.add('control-panel');
    this.garagePages.classList.add('garage');

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
    return this.garageScreen;
  }

  private feedControlPanel() {
    const createBlock = document.createElement('div');
    createBlock.classList.add('control-panel-create');

    const createName = document.createElement('input');
    createName.classList.add('control-panel-create__name');
    createName.type = 'text';
    const createColorBtn = new Button('control-panel-create__color').createButton();
    const createCarBtn = new Button('control-panel-create__crt').createButton('Create');

    const updateBlock = document.createElement('div');
    updateBlock.classList.add('control-panel-update');

    const updateName = document.createElement('input');
    updateName.classList.add('control-panel-update__name');
    updateName.type = 'text';
    const updateColorBtn = new Button('control-panel-update__color').createButton();
    const updateCarBtn = new Button('control-panel-update__upt').createButton('Update');

    const functionalBlock = document.createElement('div');
    functionalBlock.classList.add('control-panel-functional');

    const raceBtn = new Button('control-panel-functional__race').createButton('Race');
    const resetBtn = new Button('control-panel-functional__reset').createButton('Reset');
    const generateBtn = new Button('control-panel-functional__generate').createButton('Generate Cars');

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

    garageControls.append(prevPageBtn);
    garageControls.append(nextPageBtn);

    this.garagePages.append(garageTitle);
    this.garagePages.append(garageControls);
    this.addPage();
  }

  private addPage() {
    const garagePage = document.createElement('div');
    garagePage.classList.add('garage-page');

    const garagePageTitle = document.createElement('h3');
    garagePageTitle.classList.add('garage-page__title');
    garagePageTitle.append(`Page #${1}`);

    const cars = document.createElement('div');
    cars.classList.add('garage-page__cars');

    Garage.addCar(cars);

    garagePage.append(garagePageTitle);
    garagePage.append(cars);

    this.garagePages.append(garagePage);
  }

  private static addCar(cars: HTMLDivElement) {
    const car = document.createElement('div');
    car.classList.add('car');

    const carControls = document.createElement('div');
    carControls.classList.add('car-controls');

    const selectCarBtn = new Button('car-controls__select').createButton('Select');
    const removeCarBtn = new Button('car-controls__remove').createButton('Remove');

    const carName = document.createElement('p');
    carName.classList.add('car-controls__name');
    carName.append(`${'Lada'} ${'Granta'}`);

    const track = document.createElement('div');
    track.classList.add('track');

    const startBtn = new Button('track__start').createButton('S');
    const restartBtn = new Button('track__restart').createButton('R');

    const carImg = document.createElement('svg');
    carImg.classList.add('track__car-img');

    const finishImg = document.createElement('div');
    finishImg.classList.add('track__finish');

    track.append(startBtn);
    track.append(restartBtn);
    track.append(carImg);
    track.append(finishImg);

    carControls.append(selectCarBtn);
    carControls.append(removeCarBtn);
    carControls.append(carName);

    car.append(carControls);
    car.append(track);

    cars.append(car);
  }

  private static toGarage() {
    const winners = document.querySelector('.winners-screen');
    if (winners) winners.classList.remove('winners-screen_show');
  }

  private static toWinners() {
    const winners = document.querySelector('.winners-screen');
    if (winners) winners.classList.add('winners-screen_show');
  }
}

export default Garage;
