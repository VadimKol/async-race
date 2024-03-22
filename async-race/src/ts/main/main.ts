import './main.scss';
import Button from '../components/button/button';

interface IMain {
  create(): HTMLDivElement;
}

class Main implements IMain {
  private user: string | null;

  private mainScreen: HTMLDivElement;

  private header: HTMLElement;

  private main: HTMLElement;

  private mainPuzzle: HTMLDivElement;

  private sourceData: HTMLDivElement;

  private currentResultId: number;

  private currentResult: Element;

  private templateText: string[];

  private checkBtn: HTMLButtonElement;

  constructor() {
    this.user = localStorage.getItem('Login-RS-PZ-VK');
    this.mainScreen = document.createElement('div');
    this.header = document.createElement('header');
    this.main = document.createElement('main');
    this.mainPuzzle = document.createElement('div');
    this.sourceData = document.createElement('div');
    this.checkBtn = new Button().createButton();
    this.currentResultId = 0;
    this.currentResult = document.createElement('p');
    this.templateText = [
      'The students agree they have too much homework',
      'They arrived at school at 7 a.m',
      'Is your birthday in August?',
      'There is a small boat on the lake',
      'I ate eggs for breakfast',
      'I brought my camera on my vacation',
      'The capital of the United States is Washington, D.C',
      'Did you catch the ball during the baseball game?',
      'People feed ducks at the lake',
      'The woman enjoys riding her bicycle',
    ];
  }

  public create(): HTMLDivElement {
    if (!this.user) throw new Error('No user');

    this.mainScreen.classList.add('main-screen');
    this.header.classList.add('header');
    this.main.classList.add('main');
    this.mainPuzzle.classList.add('main-puzzle');
    const logOutBtn = new Button().createButton();

    this.feedPuzzle();

    this.currentResult = Array.from(this.mainPuzzle.children)[this.currentResultId];
    this.currentResult.classList.add('main-result_current');

    this.feedSource();

    logOutBtn.classList.add('header__log-out');
    logOutBtn.append('Log out');
    logOutBtn.addEventListener('click', () => this.loggedOut());

    this.checkBtn.classList.add('main__check');
    this.checkBtn.append('Check');
    this.checkBtn.addEventListener('click', (e) =>
      this.check(e, this.currentResult, this.templateText[this.currentResultId]),
    );

    this.sourceData.classList.add('main-source');
    this.sourceData.addEventListener('click', (e) => this.addWord(e, this.currentResult, true));

    this.header.append(logOutBtn);

    this.main.append(this.mainPuzzle);
    this.main.append(this.sourceData);
    this.main.append(this.checkBtn);

    this.mainScreen.append(this.header);
    this.mainScreen.append(this.main);
    return this.mainScreen;
  }

  private addWord(e: MouseEvent, sentence: Element, isResult: boolean): void {
    const word = e.target;
    let isFullFilled = true;

    if (!(word instanceof HTMLParagraphElement)) return;

    const parent = word.parentElement;

    if (!isResult && !(parent && parent.classList.contains('main-result_current'))) return;

    const wordTxt = word.textContent;

    if (!wordTxt) return;

    Array.from(sentence.children).every((child) => {
      if (!(child instanceof HTMLParagraphElement)) return false;

      const childTemp = child;

      if (childTemp.classList.contains(`main-${isResult ? 'result' : 'source'}__word_empty`)) {
        childTemp.append(wordTxt);
        childTemp.classList.remove(`main-${isResult ? 'result' : 'source'}__word_empty`);
        word.classList.add(`main-${isResult ? 'source' : 'result'}__word_empty`);
        word.textContent = null;
        childTemp.style.backgroundPositionX = word.style.backgroundPositionX;
        childTemp.style.backgroundPositionY = word.style.backgroundPositionY;
        childTemp.style.backgroundImage = word.style.backgroundImage;
        word.style.backgroundImage = 'none';
        return false;
      }
      return true;
    });

    Array.from(this.currentResult.children).forEach((child) => {
      if (child.classList.contains(`main-result__word_empty`)) isFullFilled = false;
    });

    if (isFullFilled) this.checkBtn.classList.add('main__check_show');
    else this.checkBtn.classList.remove('main__check_show');
  }

  private check(e: MouseEvent, sentence: Element, rightText: string): void {
    const buttonCheck = e.target;
    const resultText: string[] = [];

    if (!(buttonCheck instanceof HTMLButtonElement)) return;

    Array.from(sentence.children).forEach((child) => {
      if (!child.textContent) throw new Error('No word to check');
      resultText.push(child.textContent);
    });

    if (resultText.join(' ') === rightText) {
      // alert('You are winner!');
      console.log('Right sentence');
      sentence.classList.remove('main-result_current');
      sentence.classList.add('main-result_done');

      Array.from(sentence.children).forEach((child) => child.classList.add(`main-result__word_done`));

      this.currentResultId++;
      this.currentResult = Array.from(this.mainPuzzle.children)[this.currentResultId];
      this.currentResult.classList.add('main-result_current');

      this.sourceData.replaceChildren();
      this.feedSource();

      buttonCheck.classList.remove('main__check_show');
    } else console.log('Sentence mismatch'); // alert('Sentence mismatch');
  }

  private feedPuzzle(): void {
    this.templateText.forEach((text) => {
      const result = document.createElement('div');
      result.classList.add('main-result');
      result.addEventListener('click', (e) => this.addWord(e, this.sourceData, false));
      const templateArr = text.split(' ');
      // const lengthPuzzleItem = Math.floor(800 / templateArr.length);
      templateArr.forEach(() => {
        const resultBlock = document.createElement('p');
        // const resultBlock = this.createSVG(el, idx, templateArr);
        resultBlock.classList.add('main-result__word');
        resultBlock.classList.add('main-result__word_empty');
        result.append(resultBlock);
      });

      this.mainPuzzle.append(result);
    });
  }

  private feedSource(): void {
    const templateArr = this.templateText[this.currentResultId].split(' ');
    let sourceoffset = 0;
    templateArr.forEach((z) => {
      const sourceBlock = document.createElement('p');
      sourceBlock.classList.add('main-source__word');
      sourceBlock.append(z);
      setTimeout(() => {
        sourceBlock.style.backgroundPositionX = `-${sourceoffset}px`;
        sourceBlock.style.backgroundPositionY = `-${this.currentResultId * 33}px`;
        sourceBlock.style.backgroundImage =
          'url(https://raw.githubusercontent.com/rolling-scopes-school/rss-puzzle-data/main/images/level1/deerhunt.jpg)';
        sourceoffset += sourceBlock.offsetWidth;
      }, 0);
      this.sourceData.append(sourceBlock);
    });
  }

  /*   private createSVG(el: string, idx: number, templateArr: string[]): SVGSVGElement {
    const resultBlock = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    resultBlock.setAttributeNS(null, 'viewBox', `0 0 300 100`);
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.append(document.createTextNode(el));
    text.setAttributeNS(null, 'x', '56');
    text.setAttributeNS(null, 'y', '50%');
    text.setAttributeNS(null, 'style', 'font-size: 60px');
    pattern.setAttributeNS(null, 'id', 'img');
    pattern.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');
    pattern.setAttributeNS(null, 'width', '1156');
    pattern.setAttributeNS(null, 'height', '761');
    img.setAttributeNS(
      null,
      'href',
      'https://raw.githubusercontent.com/rolling-scopes-school/rss-puzzle-data/main/images/level1/deerhunt.jpg',
    );
    //img.setAttributeNS(null, 'width', '1156');
    //img.setAttributeNS(null, 'height', '761');
    img.setAttributeNS(null, 'x', '0');
    img.setAttributeNS(null, 'y', '0');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (idx === 0)
      path.setAttributeNS(
        null,
        'd',
        `M0 0h260v33.5c0 7.56 11.24-2.13 19.23-3.68 10.16-1.98 20.77 9.03 20.77 20.18 0 11.16-9.64 20.95-20.77 20.19-9.7-0.65-19.23-13.3-19.23-5.36v35.17H0V0z`,
        //`M 0 0 L 83.332031 0 L 83.332031 14.070312 C 83.332031 17.246094 88.015625 13.175781 91.347656 12.523438 C 95.578125 11.691406 100 16.316406 100 21 C 100 25.6875 95.984375 29.800781 91.347656 29.480469 C 87.304688 29.207031 83.332031 23.894531 83.332031 27.230469 L 83.332031 42 L 0 42 Z M 0 0 `,
      );
    else if (idx === templateArr.length - 1)
      path.setAttributeNS(
        null,
        'd',
        //`M0 0h340v100H0v-35.17c0-7.95 9.53 4.7 19.23 5.38 11.13 0.75 20.78-9.05 20.78-20.2 0-11.15-10.6-22.17-20.77-20.2-7.97 1.55-19.22 11.28-19.22,3.7z`,
        `M0 0h260v100H0v-35.17c0-7.95 9.53 4.7 19.23 5.38 11.13 0.75 20.78-9.05 20.78-20.2 0-11.15-10.6-22.17-20.77-20.2-7.97 1.55-19.22 11.28-19.22,3.7z`,
      );
    else
      path.setAttributeNS(
        null,
        'd',
        `M0 0h260v33.5c0 7.56 11.25-2.15 19.23-3.69 10.17-1.98 20.77 9.04 20.77 20.19 0 11.15-9.65 20.96-20.77 20.19-9.69-0.65-19.23-13.31-19.23-5.35v35.2H0v-35.2c0-7.96 9.54 4.71 19.23 5.35 11.13 0.77 20.77-9.04 20.77-20.19 0-11.15 -10.6-22.17 -20.77-20.19 -7.98 1.54 -19.23 11.25-19.23 3.69z`,
      );
    //path.setAttributeNS(null, 'style', 'fill:#999');
    path.setAttributeNS(null, 'style', 'fill:url(#img)');
    //path.setAttributeNS(null, 'x', '0');
    //path.setAttributeNS(null, 'y', '0');
    pattern.append(img);
    defs.append(pattern);
    resultBlock.append(defs);
    resultBlock.append(path);
    //resultBlock.append(text);
    return resultBlock;
  } */

  private loggedOut(): void {
    localStorage.removeItem('Login-RS-PZ-VK');
    this.mainScreen.dispatchEvent(new Event('loggedOut', { bubbles: true }));
    this.mainScreen.remove();
  }
}

export default Main;
