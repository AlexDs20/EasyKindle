let browserApi;
if (chrome !== undefined) {
    browserApi = chrome;
} else {
    browserApi = browser;
}
// Define a common API object

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

browserApi.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs)=>{
        const tabId = tabs[0].id;
        browserApi.runtime.sendMessage({ command: "is_tab_id_activated", tabId: tabId })
            .then(handleResponse, handleError);
        browserApi.scripting.insertCSS({ target: {tabId: tabId}, files: ["/content_scripts/style.css"] });
        browserApi.scripting.executeScript({ target: {tabId: tabId}, files: ["/content_scripts/kindle.js"] })
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

                    browserApi.runtime.sendMessage({ command: "trying to send message to tab", tabId: tabId });
                    browserApi.tabs.sendMessage(tabId, { command: "kindle_ext_toggle" });
                });

            })
            .catch(handleError);
    })
    .catch(handleError);
