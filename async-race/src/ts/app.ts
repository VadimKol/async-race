import Garage from './garage/garage';
import Winners from './winners/winners';

interface IApp {
  start(): void;
}

class App implements IApp {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
    /*     this.body.addEventListener('loggedIn', () => this.body.append(new StartScreen().create()));
    this.body.addEventListener('loggedOut', () => this.body.append(new Login().createLoginScreen()));
    this.body.addEventListener('start', () => this.body.append(new Main().create()));  */
  }

  public start(): void {
    this.body.append(new Garage().create());
    this.body.append(new Winners().create());
  }
}

export default App;
