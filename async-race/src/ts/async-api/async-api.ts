interface Car {
  name: string;
  color: string;
  id: number;
}

interface CarInput {
  name: string;
  color: string;
}

class AsyncAPI {
  private cars: Car[];

  private isCreated: boolean;

  private isDeleted: boolean;

  constructor() {
    this.cars = [];
    this.isCreated = false;
    this.isDeleted = false;
  }

  public async getCars() {
    // try {
    const response = await fetch('http://127.0.0.1:3000/garage', { method: 'GET', cache: 'no-store' });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.cars = await response.json();
    /*     } catch (e) {
      if (e instanceof Error) console.log(`Error = ${e.message}`, e);
    } */

    return this.cars;
  }

  public async createCar(car: CarInput) {
    this.isCreated = false;

    const response = await fetch('http://127.0.0.1:3000/garage', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });

    if (!(response.status === 201)) throw new Error('Response was not OK');

    const newCar: Car = await response.json();
    this.isCreated = true;

    return { isCreated: this.isCreated, carId: newCar.id };
  }

  public async deleteCar(carId: string) {
    this.isDeleted = false;

    const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isDeleted = true;

    return this.isDeleted;
  }
}

export default AsyncAPI;
