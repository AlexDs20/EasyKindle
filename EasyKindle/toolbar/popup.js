const ACTIVE = "Deactivate Extension";
const INACTIVE = "Activate Extension";

function handleResponse(message) {
    const button = document.getElementById('toggleButton');
    if (message.state) {
        button.textContent = ACTIVE;
    } else {
        button.textContent = INACTIVE;
    }
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs)=>{
        const tabId = tabs[0].id;
        browser.runtime.sendMessage({ command: "is_tab_id_activated", tabId: tabId })
            .then(handleResponse, handleError);
        browser.tabs.insertCSS(tabId, { file: "/content_scripts/style.css" });
        browser.tabs.executeScript(tabId, { file: "/content_scripts/kindle.js" })
            .then(() => {

                const button = document.getElementById('toggleButton');

                button.addEventListener('click', (event)=>{
                    // Change the button text based on the extension's state
                    let status;
                    if (event.target.textContent == ACTIVE) {
                        event.target.textContent = INACTIVE;
                        status = true;
                    } else {
                        event.target.textContent = ACTIVE;
                        status = false;
                    }

                    browser.tabs.sendMessage(tabId, { command: "kindle_ext_toggle" });

                });

            })
            .catch(handleError);
    })
    .catch(handleError);
