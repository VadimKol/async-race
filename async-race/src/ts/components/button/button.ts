import './button.scss';

interface IButton {
  createButton(): HTMLButtonElement;
}

class Button implements IButton {
  private btn: HTMLButtonElement;

  constructor() {
    this.btn = document.createElement('button');
  }

  public createButton() {
    this.btn.classList.add('button');
    this.btn.type = 'button';
    return this.btn;
  }
}

export default Button;
