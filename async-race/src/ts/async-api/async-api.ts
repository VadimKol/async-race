interface Car {
  name: string;
  color: string;
  id: number;
}

class AsyncAPI {
  private cars: Car[];

  constructor() {
    this.cars = [];
  }

  public async getCars() {
    // try {
    const response = await fetch('http://127.0.0.1:3000/garage', { method: 'GET', cache: 'no-store' });

    if (!response.ok) throw new Error('Response was not OK');

    this.cars = await response.json();
    /*     } catch (e) {
      if (e instanceof Error) console.log(`Error = ${e.message}`, e);
    } */

    return this.cars;
  }
}

export default AsyncAPI;
