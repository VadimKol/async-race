import './start.scss';
import Button from '../components/button/button';

interface IStartScreen {
  create(): HTMLDivElement;
}

interface User {
  firstname: string;
  surname: string;
}

class StartScreen implements IStartScreen {
  private user: string | null;

  private startScreen: HTMLDivElement;

  private startInfo: HTMLDivElement;

  constructor() {
    this.user = localStorage.getItem('Login-RS-PZ-VK');
    this.startScreen = document.createElement('div');
    this.startInfo = document.createElement('div');
  }

  public create(): HTMLDivElement {
    if (!this.user) throw new Error('No user');

    const userObj: User = JSON.parse(this.user); // TODO проверить, что парсится, и это именно User

    this.startScreen.classList.add('start-screen');
    this.startInfo.classList.add('start-info');

    const header = document.createElement('h1');
    header.classList.add('start-info__title');
    header.append('ENGLISH PUZZLE');

    const description = document.createElement('p');
    description.classList.add('start-info__description');
    description.append('Click on words, collect phrases.\nWords can be drag and drop. Select tooltips in the menu.');

    const greetings = document.createElement('p');
    greetings.classList.add('start-info__greetings');
    greetings.append(`Hello, ${userObj.firstname} ${userObj.surname} !`);

    const startBtn = new Button().createButton();
    startBtn.classList.add('start-info__start');
    startBtn.append('Start');
    startBtn.addEventListener('click', () => this.start());

    const logOutBtn = new Button().createButton();
    logOutBtn.classList.add('start-screen__log-out');
    logOutBtn.append('Log out');
    logOutBtn.addEventListener('click', () => this.loggedOut());

    this.startInfo.append(header);
    this.startInfo.append(description);
    this.startInfo.append(greetings);
    this.startInfo.append(startBtn);

    this.startScreen.append(this.startInfo);
    this.startScreen.append(logOutBtn);
    return this.startScreen;
  }

  private start() {
    this.startScreen.dispatchEvent(new Event('start', { bubbles: true }));
    this.startScreen.remove();
  }

  private loggedOut() {
    localStorage.removeItem('Login-RS-PZ-VK');
    this.startScreen.dispatchEvent(new Event('loggedOut', { bubbles: true }));
    this.startScreen.remove();
  }
}

export default StartScreen;
