class Store {
  static getGroceryList() {
    return JSON.parse(localStorage.getItem('groceryList')) || [];
  }
  static addItemToStorage(item) {
    const groceryList = Store.getGroceryList();
    groceryList.push(item);
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }
  static removeItemFromStorage(itemName) {
    const groceryList = Store.getGroceryList();
    const index = groceryList.findIndex(item => item.name === itemName);
    groceryList.splice(index, 1);
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }
  static checkIfItemIsOnTheList(itemName) {
    const groceryList = Store.getGroceryList();
    const index = groceryList.findIndex(item => item.name === itemName);
    return index >= 0;
  }
  static updateItemStatus(itemName, status) {
    const groceryList = Store.getGroceryList();
    groceryList.forEach(item => {
      if (item.name === itemName) item.status = status;
    });
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }
}

class UI {
  static createListItem(item) {
    const { name, category, status } = item;
    // select div with id === category
    const categoryDiv = document.querySelector(`#${category}`);
    // inside this div select the ul element category__items
    const list = categoryDiv.querySelector('.category__items');
    const newListItem = document.createElement('li');
    newListItem.classList.add('category__item');
    newListItem.innerHTML = `<label><input type="checkbox"/><span></span></label><button class="delete"><img src="img/delete.svg" alt=""/></button>`;
    // append the li element to the ul
    list.append(newListItem);
    newListItem.querySelector('span').textContent = name;
    if (status === 'checked') {
      newListItem.querySelector('input').classList.add('checked');
      newListItem.querySelector('input').setAttribute('checked', '');
    }
  }
  static displayGroceryList() {
    // get items from local storage or an empty array
    const groceryList = Store.getGroceryList();
    if (groceryList.length !== 0)
      // loop through the array and create the li items
      groceryList.forEach(item => {
        UI.createListItem(item);
      });
  }
  static addItem(e) {
    e.preventDefault();
    const itemName = e.target.item.value.trim().toLowerCase();
    const category = e.target.category.value;
    if (category === 'Select a category...') {
      UI.displayMessage('Please select a category!');
      return;
    }
    // check if item was already added
    if (Store.checkIfItemIsOnTheList(itemName)) {
      UI.displayMessage('This item is already on the list!');
      e.target.reset();
      return;
    }
    const newItem = new GroceryItem(itemName, category);
    Store.addItemToStorage(newItem);
    UI.createListItem(newItem);
    UI.displayMessage('The item was successfully added!', 'success');
    e.target.reset();
  }
  static deleteItem(e) {
    // check if the target was the img, child of the button with class delete
    if (e.target.closest('.delete')) {
      // select the li element and remove
      const listElement = e.target.parentElement.parentElement;
      const itemName = listElement.querySelector('span').textContent;
      listElement.remove();
      Store.removeItemFromStorage(itemName);
    }
  }
  static displayMessage(message, type = 'error') {
    const feedback = document.querySelector('.feedback');
    feedback.textContent = message;
    feedback.classList.add(type);
    setTimeout(() => {
      feedback.textContent = '';
      feedback.classList.remove(type);
    }, 4000);
  }
  static updateItemStatus(e) {
    e.target.classList.toggle('checked');
    const itemName = e.target.nextElementSibling.textContent;
    const status = e.target.classList.contains('checked')
      ? 'checked'
      : 'unchecked';
    // change status on local storage
    Store.updateItemStatus(itemName, status);
  }

  static toggleCategories(e) {
    if (e.target.classList.contains('menu-btn')) {
      const menuBtns = document.querySelectorAll('.menu-btn');
      menuBtns.forEach(button => {
        button.classList.toggle('active', button === e.target);
        const ariaSelected = button === e.target ? 'true' : 'false';
        button.setAttribute('aria-selected', ariaSelected);
      });
      const targetCategory = e.target.dataset.target;
      const allCategories = document.querySelectorAll('.category');
      if (targetCategory === 'all') {
        allCategories.forEach(category => {
          category.classList.remove('hidden', 'active');
        });
        return;
      }
      const target = document.querySelector(targetCategory);
      target.classList.add('active');
      allCategories.forEach(category => {
        category.classList.toggle('hidden', category !== target);
      });
    }
  }
}

class GroceryItem {
  constructor(name, category, status = 'unchecked') {
    this.name = name;
    this.category = category;
    this.status = status;
  }
}

// display the grocery list stored when page loads
document.addEventListener('DOMContentLoaded', UI.displayGroceryList);

// add item
const addItemForm = document.querySelector('.add-item');
addItemForm.addEventListener('submit', UI.addItem);

// delete item
const categoriesWrapper = document.querySelector('.categories-wrapper');
categoriesWrapper.addEventListener('click', UI.deleteItem);
categoriesWrapper.addEventListener('change', UI.updateItemStatus);

// menu
const categoryMenu = document.querySelector('.category-menu');
categoryMenu.addEventListener('click', UI.toggleCategories);
