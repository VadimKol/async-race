import './winners.scss';
import Button from '../components/button/button';

interface IWinners {
  create(): HTMLDivElement;
}

class Winners implements IWinners {
  private winnersScreen: HTMLDivElement;

  private header: HTMLElement;

  private main: HTMLElement;

  private nav: HTMLElement;

  private winnersPages: HTMLDivElement;

  private id: number;

  constructor() {
    this.winnersScreen = document.createElement('div');
    this.header = document.createElement('header');
    this.main = document.createElement('main');
    this.nav = document.createElement('nav');
    this.winnersPages = document.createElement('div');
    this.id = 1;
  }

  public create(): HTMLDivElement {
    this.winnersScreen.classList.add('winners-screen');
    this.header.classList.add('header');
    this.main.classList.add('main');
    this.nav.classList.add('nav');
    this.winnersPages.classList.add('winners');

    const toGarageBtn = new Button('nav__garage').createButton('To Garage');
    const toWinnersBtn = new Button('nav__winners').createButton('To Winners');

    toGarageBtn.addEventListener('click', () => this.toGarage());
    toWinnersBtn.addEventListener('click', () => this.toWinners());

    this.feedWinners();

    this.nav.append(toGarageBtn);
    this.nav.append(toWinnersBtn);

    this.header.append(this.nav);

    this.main.append(this.winnersPages);

    this.winnersScreen.append(this.header);
    this.winnersScreen.append(this.main);
    return this.winnersScreen;
  }

  private feedWinners() {
    const winnersTitle = document.createElement('h2');
    winnersTitle.classList.add('winners__title');
    winnersTitle.append(`Winners (${4})`);

    const winnersControls = document.createElement('div');
    winnersControls.classList.add('winners-controls');

    const prevPageBtn = new Button('winners-controls__prev').createButton('<-');
    const nextPageBtn = new Button('winners-controls__next').createButton('->');

    winnersControls.append(prevPageBtn);
    winnersControls.append(nextPageBtn);

    this.winnersPages.append(winnersTitle);
    this.winnersPages.append(winnersControls);
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
      const winnersPageHeaderItem = document.createElement('li');
      winnersPageHeaderItem.classList.add('winners-page-header__item');
      winnersPageHeaderItem.append(el);
      winnersPageHeader.append(winnersPageHeaderItem);
    });

    const winnersBlock = document.createElement('div');
    winnersBlock.classList.add('winners-page__winners-block');

    this.addWinner(winnersBlock);

    winnersPage.append(winnersPageTitle);
    winnersPage.append(winnersPageHeader);
    winnersPage.append(winnersBlock);

    this.winnersPages.append(winnersPage);
  }

  private addWinner(winnersBlock: HTMLDivElement) {
    const winner = document.createElement('p');
    winner.classList.add('winner');

    const winnerId = document.createElement('span');
    winnerId.classList.add('winner__id');
    winnerId.append(`${this.id}`);
    this.id += 1;

    const winnerCarImg = document.createElement('span');
    winnerCarImg.classList.add('winner__car-img');

    const winnerName = document.createElement('span');
    winnerName.classList.add('winner__name');
    winnerName.append(`${'Lada'} ${'Granta'}`);

    const winnerWins = document.createElement('span');
    winnerWins.classList.add('winner__wins');
    winnerWins.append(`${2}`);

    const winnerBestTime = document.createElement('span');
    winnerBestTime.classList.add('winner__best-time');
    winnerBestTime.append(`${5.63}`);

    winner.append(winnerId);
    winner.append(winnerCarImg);
    winner.append(winnerName);
    winner.append(winnerWins);
    winner.append(winnerBestTime);

    winnersBlock.append(winner);
  }

  private toGarage() {
    this.winnersScreen.classList.remove('winners-screen_show');
  }

  private toWinners() {
    this.winnersScreen.classList.add('winners-screen_show');
  }
}

export default Winners;
