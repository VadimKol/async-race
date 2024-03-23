import './button.scss';

interface IButton {
  createButton(name?: string): HTMLButtonElement;
}

class Button implements IButton {
  private btn: HTMLButtonElement;

  constructor(className: string) {
    this.btn = document.createElement('button');
    this.btn.classList.add(className);
  }

  public createButton(name: string = '') {
    this.btn.classList.add('button');
    this.btn.type = 'button';
    this.btn.append(name);
    return this.btn;
  }
}

export default Button;
