// Array to keep track of created scenarios
const scenarios = [];

// Function to add a new requirement section
function addRequirement() {
    const container = document.getElementById('requirementsContainer');
    const requirementItem = document.createElement('div');
    requirementItem.className = 'requirement-item';

    requirementItem.innerHTML = `
      <label>Type:</label>
      <select name="type[]" required onchange="toggleHeaderNameInput(this)">
          <option value="token">Token</option>
          <option value="header">Header</option>
      </select>

      <div class="header-name-field" style="display: none;">
          <label>Header Name:</label>
          <input type="text" name="headerName[]" placeholder="Enter header name">
      </div>

      <label>Value:</label>
      <input type="text" name="value[]" required value="id_token">

      <label>Get From Previous:</label>
      <input type="checkbox" name="getFromPrevious[]" checked>

      <button type="button" onclick="removeRequirement(this)">Remove</button>
    `;
    container.appendChild(requirementItem);
}

// Function to remove a requirement section
function removeRequirement(button) {
    button.parentElement.remove();
}

// Function to add scenario data to the scenarios array
function addScenario() {

    const orderElement = document.getElementById('order');
    const methodElement = document.getElementById('method');
    const urlElement = document.getElementById('url');
    const requestBodyElement = document.getElementById('requestBody');
    const isEndElement = document.getElementById('isEnd');

    // Check if each required element is present
    if (!orderElement || !methodElement || !urlElement || !requestBodyElement || !isEndElement) {
        console.error("One or more form fields are missing.");
        return;
    }

    const scenario = {
        requirements: Array.from(document.querySelectorAll('.requirement-item')).map(item => {
            const typeInput = item.querySelector('input[name="type[]"]');
            const headerInput = item.querySelector('input[name="headerName[]"]');
            const valueInput = item.querySelector('input[name="value[]"]');
            const getFromPreviousInput = item.querySelector('input[name="getFromPrevious[]"]');
            return {
                type: typeInput ? typeInput.value : '',
                value: valueInput ? valueInput.value : '',
                header: headerInput ? headerInput.value : '',
                getFromPrevious: getFromPreviousInput ? getFromPreviousInput.checked : false
            };
        }),
        order: parseInt(orderElement.value) || 0,
        method: methodElement.value || '',
        url: urlElement.value || '',
        requestBody:JSON.parse(requestBodyElement.value)|| '',
        isEnd: isEndElement.checked || false
    };

    scenarios.push(scenario); // Add scenario to the array
    addCard(scenario.order, scenario.method, scenario.url); // Add card visually
    clearForm();
}

// Function to create and add a card
function addCard(order, method, url) {
    const cardContainer = document.getElementById('cardContainer');
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <p><strong>Order:</strong> ${order}</p>
        <p><strong>Method:</strong> ${method}</p>
        <p><strong>URL:</strong> ${url}</p>
    `;

    cardContainer.appendChild(card); // Append the card to the container
}

// Function to submit and print all scenarios
function submitScenarios() {

    fetch('/submit-scenario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenarios) // Send scenarios array as JSON
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit scenarios');
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from server:", data);
            document.getElementById('response').innerText = JSON.stringify(data, null, 2);
            scenarios.length = 0; // Clear the scenarios array after successful submission
        })
        .catch(error => {
            console.error("Error submitting scenarios:", error);
        });
}

// Function to clear form data
function clearForm() {
    document.getElementById('scenarioForm').reset();
    document.getElementById('requirementsContainer').innerHTML = '';
    addRequirement(); // Add an initial requirement field
}


function toggleHeaderNameInput(selectElement) {
    const requirementItem = selectElement.closest('.requirement-item');
    const headerNameField = requirementItem.querySelector('.header-name-field');
    headerNameField.style.display = selectElement.value === 'header' ? 'block' : 'none';
}