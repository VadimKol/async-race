interface Car {
  name: string;
  color: string;
  id: number;
}

interface CarInput {
  name: string;
  color: string;
}

interface Speed {
  velocity: number;
  distance: number;
}

interface Aborted {
  controller: AbortController;
  carId: number;
}

class AsyncAPI {
  private cars: Car[];

  private car: Car;

  private isCreated: boolean;

  private isDeleted: boolean;

  private isUpdated: boolean;

  private isStarted: boolean;

  private isStopped: boolean;

  public aborted: Aborted[];

  constructor() {
    this.cars = [];
    this.car = { name: '', color: '#ffffff', id: 0 };
    this.isCreated = false;
    this.isDeleted = false;
    this.isUpdated = false;
    this.isStarted = false;
    this.isStopped = false;
    this.aborted = [];
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

  public async getCar(carId: string) {
    const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.car = await response.json();

    return this.car;
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

  public async updateCar(car: Car) {
    this.isUpdated = false;

    const response = await fetch(`http://127.0.0.1:3000/garage/${car.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: car.name, color: car.color }),
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isUpdated = true;

    return this.isUpdated;
  }

  public async startEngine(carId: string) {
    this.isStarted = false;
    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=started`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    const carSpeed: Speed = await response.json();

    return Math.floor(carSpeed.distance / carSpeed.velocity);
  }

  public async stopEngine(carId: string) {
    this.isStopped = false;
    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=stopped`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isStopped = true;

    return this.isStopped;
  }

  public async driveCar(carId: string) {
    const control = new AbortController();
    this.aborted.push({ controller: control, carId: Number(carId) });
    // try {

    // аборт и 500 ошибка
    // но 500 ошибка не ловится выше, все норм
    // но можно было бы перехватывать здесь все 3 случая, а аборт прокидывать выше
    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=drive`, {
      method: 'PATCH',
      cache: 'no-store',
      signal: control.signal,
    });

    if (response.status === 500) return false;

    if (!(response.status === 200)) throw new Error('Response was not OK');
    /*     } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') console.log('Car was stopped');
    } */

    return true;
  }
}

export default AsyncAPI;
