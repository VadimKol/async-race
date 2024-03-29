import Garage from './garage/garage';
import Winners from './winners/winners';

class App {
  private body: HTMLElement;

  constructor() {
    this.body = document.body;
    this.body.classList.add('body');
    /*     this.body.addEventListener('loggedIn', () => this.body.append(new StartScreen().create()));
    this.body.addEventListener('loggedOut', () => this.body.append(new Login().createLoginScreen()));
    this.body.addEventListener('start', () => this.body.append(new Main().create()));  */
  }

  public start(): void {
    const winners = new Winners();
    const garage = new Garage();
    this.body.append(garage.create());
    this.body.append(winners.create());
    this.body.addEventListener('createWinner', () => winners.addWinnerInfo(garage.winner));
    this.body.addEventListener('deleteWinner', () => winners.deleteWinnerInfo(garage.winner));
  }
}

export default App;
