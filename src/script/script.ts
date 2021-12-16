interface Debet {
  name: 'Debet';
  balance: number;
  limit? : number;
  isActive: boolean;
  currency: string;
}

interface Credit {
  name: 'Credit';
  balance: number;
  limit: number;
  isActive: boolean;
  currency: string;
}

type account = Credit | Debet;

class Client {
  name: string;
  isActive: boolean;
  registration: object;
  id? : number;
  checks: account[];
  constructor(dataClient: Client) {
    this.name = dataClient.name;
    this.isActive = dataClient.isActive;
    this.registration = dataClient.registration;
    this.id = dataClient.id;
    this.checks = dataClient.checks;
  }
}

class Bank {
  clients: Client[];

  constructor() {
    this.clients = [];
  }
  addClient(dataClient: Client) {
    this.clients.push(dataClient);
  }

  async haveMoney(callback: Function): Promise <null | number> {
    let response = await fetch('https://freecurrencyapi.net/api/v2/latest?apikey=dae13160-3b0e-11ec-8361-e108ba6473f9');
    let currencies = (await response.json()).data;
    let result: number = 0;
    if (this.clients.length) {
      this.clients.forEach((client) => {
        if (client.checks.length) {
          client.checks.forEach((check) => {
            if (check.currency === callback(check)) {
              result += check.balance;
            } else {
              result += (check.balance / currencies[check.currency]) * currencies[callback(check)];
            }
          })
        }
      })
      return result;
    }
    return null;
  }

  async debtMoney(callback: Function): Promise <null | number>  {
    let response = await fetch('https://freecurrencyapi.net/api/v2/latest?apikey=dae13160-3b0e-11ec-8361-e108ba6473f9');
    let {data} = await response.json();
    let result: number = 0;
    if (this.clients.length) {
      this.clients.forEach((client) => {
        if (client.checks.length) {
          client.checks.forEach((check) => {
            if (check.name === 'Credit' && check.balance < check.limit) {
              if (check.currency === callback(check)) {
                result += check.limit - check.balance;
              } else {
                result += ((check.limit / data[check.currency]) * data[callback(check)]) - ((check.balance / data[check.currency]) * data[callback(check)]);
              }
            }
          })
        }
      })
      return result;
    }
    return null;
  }

  async sumClientsDebt(callback: Function, isActive: Function): Promise <null | {[key: string]: number}> {
    let response = await fetch('https://freecurrencyapi.net/api/v2/latest?apikey=dae13160-3b0e-11ec-8361-e108ba6473f9');
    let currencies = (await response.json()).data;
    let result: { [key: string]: number } = {};
    result.clients = 0;
    result.debt = 0;
    if (this.clients.length) {
      this.clients.forEach((client) => {
        if (isActive(client)) {
          client.checks.forEach((check) => {
            if (check.name === 'Credit' && check.balance < check.limit) {
              if (check.currency === callback(check)) {
                result.clients++;
                result.debt += check.limit - check.balance;
              } else {
                result.clients++;
                result.debt += ((check.limit / currencies[check.currency]) * currencies[callback(check)]) - ((check.balance / currencies[check.currency]) * currencies[callback(check)]);
              }
            }
          })
        }
      })
      return result;
    }
    return null;
  }
}
let bank = new Bank()

bank.addClient(new Client({
  name: 'anna',
  isActive: true,
  registration: new Date(),
  checks: [{
      name: 'Debet',
      balance: 1000,
      isActive: true,
      currency: 'UAH',
    },
    {
      name: 'Credit',
      balance: 1000,
      limit: 1000,
      isActive: true,
      currency: 'UAH',
    },
  ],
}))

bank.addClient(new Client({
  name: 'maks',
  isActive: true,
  registration: new Date(),
  checks: [{
      name: 'Debet',
      balance: 1000,
      isActive: true,
      currency: 'UAH',
    },
    {
      name: 'Credit',
      balance: 1000,
      limit: 1000,
      isActive: true,
      currency: 'UAH',
    },
  ],
}))
bank.addClient(new Client({
  name: 'ivan',
  isActive: true,
  registration: new Date(),
  checks: [{
      name: 'Debet',
      balance: 1000,
      isActive: true,
      currency: 'UAH',
    },
    {
      name: 'Credit',
      balance: 1000,
      limit: 1000,
      isActive: true,
      currency: 'UAH',
    },
  ],
}))

class Render {
  mainBlock: HTMLElement;
  clientCard?: HTMLElement;
  cardBlock?: HTMLElement;
  buttonChange?: HTMLElement;
  buttonDelete?: HTMLElement;
  indexActiveCard?: number = 0;
  isFlag?: boolean = false;
  indexObject?: number = 0;
  blockProperty?: HTMLElement;

  constructor(container: string) {
    this.mainBlock = document.querySelector(container) as HTMLElement;
    this.createStartInterface(this.mainBlock);
    this.createCard();
  }
  createStartInterface(container: HTMLElement): void {
    container.innerHTML =
      `<div class="cardBlock"></div>
   <div class="addCard">add card</div>
   <div class="popupWindow">
     <div class="backgroundWindow"></div>
     <div class="modalWindow">
      <input type="text" placeholder="name" data-id="name" class="name namePopup">
      <label for="isActive">Active?</label>
      <input type="radio" id="isActive" data-id="isActive" class="isActive isActivePopup">
      <div class="Debet">
        <p>Debet</p>
        <input type="number" placeholder="balance" class="balance balanceDebetPopup" data-id="balanceDebet">
        <label for="isActiveDebet">Active card?</label>
        <input type="radio" id="isActiveDebet" class="isActive isActiveDebetPopup" data-id="isActiveDebet">
        <select class="currency currencyDebetPopup" data-id="currencyDebetPopup">
          <option>UAH</option>
          <option>EUR</option>
          <option>RUB</option>
          <option>PLN</option>
        </select>
      </div>
      <div class="Credit">
        <p>Credit</p>
        <input type="number" placeholder="balance" class="balance balanceCreditPopup" data-id="balanceCredit">
        <input type="number" placeholder="limit" class="limit limitCreditPopup" data-id="limitCredit">
        <label for="isActiveCredit">Active card?</label>
        <input type="radio" id="isActiveCredit" class="isActive isActiveCreditPopup" data-id="isActiveCredit">
        <select class="currency currencyCreditPopup" data-id="currencyCredit">
          <option>UAH</option>
          <option>EUR</option>
          <option>RUB</option>
          <option>PLN</option>
        </select>
      </div>
      <div class="buttonSave">save</div>
  </div>`;
    ((document.querySelector('.addCard')) as HTMLElement).addEventListener('click', () => {
      this.isFlag = true;
      ((document.querySelector('.popupWindow')) as HTMLElement).setAttribute('style', 'display: block');
    });
    ((document.querySelector('.backgroundWindow')) as HTMLElement).addEventListener('click', () => {
      ((document.querySelector('.popupWindow')) as HTMLElement).setAttribute('style', 'display: none');
    });
    ((document.querySelector('.buttonSave')) as HTMLElement).addEventListener('click', () => {
      this.changeCard();
      ((document.querySelector('.popupWindow')) as HTMLElement).setAttribute('style', 'display: none');
    })
  }

  createCard(): void {
    for (let i = 0; i < bank.clients.length; i++) {
      bank.clients[i]['id'] = i;
      this.cardBlock = document.querySelector('.cardBlock') as HTMLElement;
      if (!this.cardBlock.children[i]) {
        let objectClient: Client = bank.clients[i];
        this.clientCard = this.cardBlock.appendChild(document.createElement('div'));
        this.clientCard.classList.add("clientCard");
        this.clientCard.setAttribute('data-id', String(i));
        for (let property in objectClient) {
          let prop = property as keyof Client;
          if (property === 'checks') {
            for (let i = 0; i < objectClient[property].length; i++) {
              let blockCheck = this.clientCard.appendChild(document.createElement('div'));
              blockCheck.className = "blockCheck";
              let clientCheck = objectClient[property][i];
              for (let item in clientCheck) {
                let items = item as keyof account;
                this.blockProperty = blockCheck.appendChild(document.createElement('div'));
                this.blockProperty.innerHTML =
                  `<span class="checkProperty">${item}</span>
                   <span class="${item}${objectClient[property][i]['name']}">${objectClient[property][i][items]}</span>`;
              }
            }
          } else {
            this.blockProperty = this.clientCard.appendChild(document.createElement('div'));
            this.blockProperty.className = 'blockProperty';
            this.blockProperty.innerHTML =
              `<span class="property">${property}</span>
               <span class="${property}">${objectClient[prop]}</span>`;
          }
        }
        this.buttonChange = this.clientCard.appendChild(document.createElement('div'));
        this.buttonChange.innerText = 'Change';
        this.buttonChange.className = 'buttonChange';
        this.buttonChange.setAttribute('data-update', String(bank.clients[i]['id']));
        this.buttonChange.setAttribute('data-function', 'changeUser');
        this.buttonDelete = this.clientCard.appendChild(document.createElement('div'));
        this.buttonDelete.innerText = 'Delete';
        this.buttonDelete.className = 'buttonDelete';
        this.buttonDelete.setAttribute('data-function', 'deleteUser');
        this.buttonDelete.setAttribute('data-update', String(bank.clients[i]['id']));
        this.clientCard.addEventListener('click', (event) => {
          let action = ((event.target) as HTMLElement).getAttribute('data-function');
          if (action === 'changeUser') {
            if (event.target) {
              this.changeUser(event.target as HTMLElement);
            }
          }
          if (action === 'deleteUser') {
            if (event.target) {
              this.deleteUser(event.target as HTMLElement);
            }
          }
        })
      }
    }
  }
  changeUser(item: HTMLElement): void {
    for (let i = 0; i < bank.clients.length; i++) {
      if (bank.clients[i]['id'] === Number(item.getAttribute('data-update'))) {
        this.indexActiveCard = bank.clients.indexOf(bank.clients[i]);
        ((document.querySelector('.popupWindow')) as HTMLElement).setAttribute('style', 'display: block');
      }
    }
  }

  deleteUser(item: HTMLElement): void {
    for (let i = 0; i < document.getElementsByClassName('cardBlock')[0].children.length; i++) {
      if (document.getElementsByClassName('cardBlock')[0].children[i] === item.parentNode) {
        ((item.parentNode) as Element).remove();
        bank.clients.splice(i, 1);
      }
    }
  }

  changeCard(): void {
    let copyClietnInfo = {} as Client;
    if (this.isFlag) {
      copyClietnInfo['name'] = ((document.querySelector('.namePopup')) as HTMLInputElement).value;
      copyClietnInfo['isActive'] = ((document.querySelector('.isActivePopup')) as HTMLInputElement).checked;
      copyClietnInfo['registration'] = new Date();
      copyClietnInfo.checks = [];
      copyClietnInfo.checks[0] = {} as account;
      copyClietnInfo.checks[0]['name'] = 'Debet';
      copyClietnInfo.checks[0]['balance'] = Number(((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).value);
      copyClietnInfo.checks[0]['isActive'] = ((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).checked;
      copyClietnInfo.checks[0]['currency'] = ((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).value;
      copyClietnInfo.checks[1] = {} as account;
      copyClietnInfo.checks[1]['name'] = 'Credit';
      copyClietnInfo.checks[1]['balance'] = Number(((document.querySelector('.balanceCreditPopup')) as HTMLInputElement).value);
      copyClietnInfo.checks[1]['limit'] = Number(((document.querySelector('.limitCreditPopup')) as HTMLInputElement).value);
      copyClietnInfo.checks[1]['isActive'] = ((document.querySelector('.isActiveCreditPopup')) as HTMLInputElement).checked;
      copyClietnInfo.checks[1]['currency'] = ((document.querySelector('.currencyDebetPopup')) as HTMLInputElement).value;
      this.isFlag = false;
      this.indexObject = 0;
      bank.addClient(new Client(copyClietnInfo));
      this.createCard();
    } else {
      if (this.indexActiveCard !== undefined) {
        document.getElementsByClassName('name')[this.indexActiveCard].innerHTML = ((document.querySelector('.namePopup')) as HTMLInputElement).value;
        bank.clients[this.indexActiveCard]['name'] = ((document.querySelector('.namePopup')) as HTMLInputElement).value;
        document.getElementsByClassName('isActive')[this.indexActiveCard].innerHTML = String(((document.querySelector('.isActivePopup')) as HTMLInputElement).checked);
        bank.clients[this.indexActiveCard]['isActive'] = ((document.querySelector('.isActivePopup')) as HTMLInputElement).checked;
        document.getElementsByClassName('balanceDebet')[this.indexActiveCard].innerHTML = String(((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).value);
        bank.clients[this.indexActiveCard].checks[0]['balance'] = Number(((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).value);
        document.getElementsByClassName('isActiveDebet')[this.indexActiveCard].innerHTML = String(((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).checked);
        bank.clients[this.indexActiveCard].checks[0]['isActive'] = ((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).checked;
        document.getElementsByClassName('currencyDebet')[this.indexActiveCard].innerHTML = ((document.querySelector('.currencyDebetPopup')) as HTMLInputElement).value;
        bank.clients[this.indexActiveCard].checks[0]['currency'] = ((document.querySelector('.balanceDebetPopup')) as HTMLInputElement).value;
        document.getElementsByClassName('balanceCredit')[this.indexActiveCard].innerHTML = String(((document.querySelector('.balanceCreditPopup')) as HTMLInputElement).value);
        bank.clients[this.indexActiveCard].checks[1]['balance'] = Number(((document.querySelector('.balanceCreditPopup')) as HTMLInputElement).value);
        document.getElementsByClassName('limitCredit')[this.indexActiveCard].innerHTML = String(((document.querySelector('.limitCreditPopup')) as HTMLInputElement).value);
        bank.clients[this.indexActiveCard].checks[1]['limit'] = Number(((document.querySelector('.limitCreditPopup')) as HTMLInputElement).value);
        document.getElementsByClassName('isActiveCredit')[this.indexActiveCard].innerHTML = String(((document.querySelector('.isActiveCreditPopup')) as HTMLInputElement).checked);
        bank.clients[this.indexActiveCard].checks[1]['isActive'] = ((document.querySelector('.isActiveCreditPopup')) as HTMLInputElement).checked;
        document.getElementsByClassName('currencyCredit')[this.indexActiveCard].innerHTML = ((document.querySelector('.currencyDebetPopup')) as HTMLInputElement).value;
        bank.clients[this.indexActiveCard].checks[1]['currency'] = ((document.querySelector('.currencyDebetPopup')) as HTMLInputElement).value;
      }
    }
    ((document.querySelector('.popupWindow')) as HTMLElement).setAttribute('style', 'display: none');
    ((document.querySelector('.isActivePopup')) as HTMLInputElement).checked = false;
    ((document.querySelector('.isActiveDebetPopup')) as HTMLInputElement).checked = false;
    ((document.querySelector('.isActiveCreditPopup')) as HTMLInputElement).checked = false;
  }
}
let render = new Render('.mainBlock');