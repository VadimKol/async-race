import './winners.scss';
import Button from '../components/button/button';
import AsyncAPI from '../async-api/async-api';
import { Winner } from '../util/types';

const MAX_WINNERS_ON_PAGE = 10;

enum SortType {
  ID = 'id',
  WINS = 'wins',
  TIME = 'time',
}

interface SortObj {
  type: string;
  order: string;
}

class Winners {
  private winnersScreen: HTMLDivElement;

  private header: HTMLElement;

  private main: HTMLElement;

  private nav: HTMLElement;

  private winnersPages: HTMLDivElement;

  private winnersBlock: HTMLDivElement;

  private asyncApi: AsyncAPI;

  private currentPage: number;

  private numberSort: HTMLLIElement;

  private winsSort: HTMLLIElement;

  private timeSort: HTMLLIElement;

  private sortObj: SortObj;

  constructor() {
    this.winnersScreen = document.createElement('div');
    this.header = document.createElement('header');
    this.main = document.createElement('main');
    this.nav = document.createElement('nav');
    this.winnersPages = document.createElement('div');
    this.winnersBlock = document.createElement('div');
    this.numberSort = document.createElement('li');
    this.winsSort = document.createElement('li');
    this.timeSort = document.createElement('li');
    this.asyncApi = new AsyncAPI();
    this.currentPage = 1;
    this.sortObj = { type: 'id', order: 'ASC' };
  }

  public create(): HTMLDivElement {
    this.winnersScreen.classList.add('winners-screen');
    this.header.classList.add('header');
    this.main.classList.add('main');
    this.nav.classList.add('nav');
    this.winnersPages.classList.add('winners');
    this.winnersBlock.classList.add('winners-page__winners-block');
    this.numberSort.classList.add('winners-page-header__item');
    this.winsSort.classList.add('winners-page-header__item');
    this.timeSort.classList.add('winners-page-header__item');

    const toGarageBtn = new Button('nav__garage').createButton('To Garage');
    const toWinnersBtn = new Button('nav__winners').createButton('To Winners');

    toGarageBtn.addEventListener('click', () => this.toGarage());
    toWinnersBtn.addEventListener('click', () => this.toWinners());

    this.feedWinners();

    this.nav.append(toGarageBtn, toWinnersBtn);
    this.header.append(this.nav);
    this.main.append(this.winnersPages);
    this.winnersScreen.append(this.header, this.main);

    this.UpdateWinnersPage(this.sortObj.type, this.sortObj.order);
    return this.winnersScreen;
  }

  private feedWinners() {
    const winnersTitle = document.createElement('h2');
    winnersTitle.classList.add('winners__title');

    const winnersControls = document.createElement('div');
    winnersControls.classList.add('winners-controls');

    const prevPageBtn = new Button('winners-controls__prev').createButton('<-');
    const nextPageBtn = new Button('winners-controls__next').createButton('->');
    prevPageBtn.addEventListener('click', () => this.movePage(false));
    nextPageBtn.addEventListener('click', () => this.movePage(true));

    winnersControls.append(prevPageBtn, nextPageBtn);
    this.winnersPages.append(winnersTitle, winnersControls);
    this.addPage();
  }

  private addPage() {
    const winnersPage = document.createElement('div');
    winnersPage.classList.add('winners-page');

    const winnersPageTitle = document.createElement('h3');
    winnersPageTitle.classList.add('winners-page__title');
    winnersPageTitle.append(`Page #${1}`);

    const winnersPageHeader = document.createElement('ul');
    winnersPageHeader.classList.add('winners-page-header');

    const headerNames = ['Number', 'Car', 'Name', 'Wins', 'Best time (seconds)'];

    headerNames.forEach((el) => {
      if (el === 'Number') {
        this.numberSort.append(el);
        this.numberSort.addEventListener('click', () => this.sortBy(this.numberSort, this.winsSort, this.timeSort));
        winnersPageHeader.append(this.numberSort);
      } else if (el === 'Wins') {
        this.winsSort.append(el);
        this.winsSort.addEventListener('click', () => this.sortBy(this.winsSort, this.numberSort, this.timeSort));
        winnersPageHeader.append(this.winsSort);
      } else if (el === 'Best time (seconds)') {
        this.timeSort.append(el);
        this.timeSort.addEventListener('click', () => this.sortBy(this.timeSort, this.numberSort, this.winsSort));
        winnersPageHeader.append(this.timeSort);
      } else {
        const winnersPageHeaderItem = document.createElement('li');
        winnersPageHeaderItem.classList.add('winners-page-header__item');
        winnersPageHeaderItem.append(el);
        winnersPageHeader.append(winnersPageHeaderItem);
      }
    });

    winnersPage.append(winnersPageTitle, winnersPageHeader, this.winnersBlock);
    this.winnersPages.append(winnersPage);
  }

  private sortBy(sorting: HTMLLIElement, removeSortFirst: HTMLLIElement, removeSortSecond: HTMLLIElement) {
    removeSortFirst.classList.remove('winners-page-header__item_asc');
    removeSortFirst.classList.remove('winners-page-header__item_desc');
    removeSortSecond.classList.remove('winners-page-header__item_asc');
    removeSortSecond.classList.remove('winners-page-header__item_desc');

    let sortType = '';

    switch (sorting.textContent) {
      case 'Number':
        sortType = SortType.ID;
        break;
      case 'Wins':
        sortType = SortType.WINS;
        break;
      case 'Best time (seconds)':
        sortType = SortType.TIME;
        break;
      default:
        break;
    }
    this.sortObj.type = sortType;

    if (sorting.classList.contains('winners-page-header__item_asc')) {
      sorting.classList.remove('winners-page-header__item_asc');
      sorting.classList.add('winners-page-header__item_desc');
      this.sortObj.order = 'DESC';
      this.UpdateWinnersPage(sortType, 'DESC');
    } else {
      sorting.classList.remove('winners-page-header__item_desc');
      sorting.classList.add('winners-page-header__item_asc');
      this.sortObj.order = 'ASC';
      this.UpdateWinnersPage(sortType, 'ASC');
    }
  }

  private addWinner(id: number, wins: number, time: number, name: string, color: string) {
    const winner = document.createElement('p');
    winner.classList.add('winner');

    const winnerId = document.createElement('span');
    winnerId.classList.add('winner__id');
    winnerId.append(`${id}`);

    const winnerName = document.createElement('span');
    winnerName.classList.add('winner__name');
    winnerName.append(name);

    const winnerWins = document.createElement('span');
    winnerWins.classList.add('winner__wins');
    winnerWins.append(`${wins}`);

    const winnerBestTime = document.createElement('span');
    winnerBestTime.classList.add('winner__best-time');
    winnerBestTime.append(`${time}`);

    winner.append(winnerId);
    winner.append(Winners.setCarImg(color));
    winner.append(winnerName);
    winner.append(winnerWins);
    winner.append(winnerBestTime);

    this.winnersBlock.append(winner);
  }

  private static setCarImg(carColor: string): SVGSVGElement {
    const carImg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    carImg.classList.add('winner__car-img');
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

  private async UpdateWinnersPage(sort: string, order: string) {
    const { total, winners } = await this.asyncApi.getWinners(this.currentPage, MAX_WINNERS_ON_PAGE, sort, order);
    const winnersTitle = this.winnersPages.querySelector('.winners__title');
    if (winnersTitle) winnersTitle.textContent = `Winners (${total})`;
    const winnersPageTitle = this.winnersPages.querySelector('.winners-page__title');
    if (winnersPageTitle) winnersPageTitle.textContent = `Page #${this.currentPage}`;
    const height = this.winnersPages.clientHeight;
    this.winnersPages.style.height = `${height}px`;
    this.winnersBlock.replaceChildren();
    let lastElement = 0;
    winners.forEach(async (el) => {
      const { name, color } = await this.asyncApi.getCar(String(el.id));
      this.addWinner(el.id, el.wins, el.time, name, color);
      lastElement += 1;
      if (lastElement === winners.length) this.winnersPages.style.height = 'auto';
    });
    if (winners.length === 0) this.winnersPages.style.height = 'auto';
  }

  public async addWinnerInfo(winner: Winner) {
    const winnerInfo = await this.asyncApi.getWinner(String(winner.id));
    if (winnerInfo.wins === 0) {
      await this.asyncApi.createWinner(winner);
    } else {
      if (winner.time < winnerInfo.time) winnerInfo.time = winner.time;
      winnerInfo.wins += 1;
      await this.asyncApi.updateWinner(winnerInfo);
    }
    this.UpdateWinnersPage(this.sortObj.type, this.sortObj.order);
  }

  public async deleteWinnerInfo(winner: Winner) {
    const winnerInfo = await this.asyncApi.getWinner(String(winner.id));
    if (winnerInfo.wins !== 0) {
      await this.asyncApi.deleteWinner(String(winner.id));
      this.UpdateWinnersPage(this.sortObj.type, this.sortObj.order);
    }
  }

  public async updateWinnerInfo() {
    this.UpdateWinnersPage(this.sortObj.type, this.sortObj.order);
  }

  private async movePage(whereTo: boolean) {
    this.currentPage = whereTo ? this.currentPage + 1 : this.currentPage - 1;

    if (this.currentPage < 1) {
      this.currentPage = 1;
      return;
    }

    const { winners } = await this.asyncApi.getWinners(
      this.currentPage,
      MAX_WINNERS_ON_PAGE,
      this.sortObj.type,
      this.sortObj.order,
    );

    if (winners.length === 0) this.currentPage = whereTo ? this.currentPage - 1 : this.currentPage + 1;
    else this.UpdateWinnersPage(this.sortObj.type, this.sortObj.order);
  }

  private toGarage() {
    document.body.classList.remove('body_overflow');
    this.winnersScreen.classList.remove('winners-screen_show');
  }

  private toWinners() {
    document.body.classList.add('body_overflow');
    this.winnersScreen.classList.add('winners-screen_show');
  }
}

export default Winners;
