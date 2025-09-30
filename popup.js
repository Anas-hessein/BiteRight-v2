
document.addEventListener("DOMContentLoaded", async () => {
    await updateExtenTi();
});  




async function updateTabInfo() {
    const tabInfo = document.getElementById("tab-info");
    const globalLimitInput = document.getElementById("global-limit")
    if (tabInfo && globalLimitInput) {
        const tabs = await chrome.tabs.query({});
        const limit = parseInt(globalLimitInput.value, 10) || 6
        tabInfo.textContent = `You have ${tabs.length} tabs open. Limit: ${limit}`
        

        if (tabs.length > limit) {
            tabInfo.style.color = "#ff6b6b"
        } else {
            tabInfo.style.color = "#77dd77"
        }
    }
}



let junkSites = ["https://egypt.burgerking.delivery/", "https://www.mcdelivery.eg/eg/", "https://egypt.kfc.me/en/", "https://www.papajohns.com/", "https://www.wendys.com/en-gb/", "https://www.papajohnsegypt.com/", "https://www.dominos.co.uk/", "https://www.dunkindonuts.com/", "https://www.fiveguys.com/online-ordering/", "https://fiveguys.co.uk/", "https://www.burgerking.co.uk/store-locator/address", "https://www.shakeshack.com.my/", "https://www.papajohnsegypt.com/", "https://hotlines.tel/en/sps/", ]
let healthySites = ["https://prepkitchen.co.uk/", "https://detoxkitchen.co.uk/", "https://www.macromealsuk.co.uk/", "https://www.frive.co.uk/", "https://www.treatsegypt.com/", "https://wagbafit.com/", "https://www.proteinbox-egypt.com/menu", "https://chefboxeg.com/"]
let urlArray = []

function updateJunkSitesDropdown() {
    const dropdownContainer = document.getElementById("anas45")
    if (dropdownContainer) {
        const popupListHtml = `
            <select id="JunkSitesList">
                <option>Blocked Sites (${junkSites.length})</option>
                ${junkSites.map(site => `<option value="${site}">${site}</option>`).join('')}
            </select>
            <div class="icon-container">
                <i class=" fa-solid fa-caret-down"></i>
            </div>
        `;
        dropdownContainer.innerHTML = popupListHtml
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const savedSites = await chrome.storage.sync.get(["junkSites"])
        if (savedSites.junkSites) {
            junkSites = savedSites.junkSites
        }
    } catch (error) {
        console.error("Error loading junk sites:", error)
    }
    
    updateJunkSitesDropdown()
    

    const globalLimitInput = document.getElementById("global-limit")
    const roastStyleSelect = document.getElementById("roast-style")
    const hardLimitCheckbox = document.getElementById("hard-limit")
    const status = document.getElementById("status")
    const saveButton = document.getElementById("save")
    const closeExtraButton = document.getElementById("close-extra")
    

    try {
        const data = await chrome.storage.local.get(["globalLimit", "roastStyle", "hardLimitMode"])
        
        if (globalLimitInput) globalLimitInput.value = data.globalLimit || 6
        if (roastStyleSelect) roastStyleSelect.value = data.roastStyle || "funny"
        if (hardLimitCheckbox) hardLimitCheckbox.checked = !!data.hardLimitMode
        

        await updateTabInfo()
        

        if (globalLimitInput) {
            globalLimitInput.addEventListener("input", updateTabInfo)
        }
    } catch (error) {
        console.error("Error loading roast/tab settings:", error)
    }

    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            try {
                await chrome.storage.local.set({
                    globalLimit: parseInt(globalLimitInput.value, 10),
                    roastStyle: roastStyleSelect.value,
                    hardLimitMode: hardLimitCheckbox.checked
                });
                
                if (status) {
                    status.textContent = "✅ Settings saved!"
                    status.style.color = "#77dd77"
                    setTimeout(() => status.textContent = "", 2000)
                }
                
                await updateTabInfo();
            } catch (error) {
                console.error("Error saving settings:", error)
                if (status) {
                    status.textContent = "❌ Error saving settings"
                    status.style.color = "#ff6b6b"
                }
            }
        });
    }
    

    if (closeExtraButton) { 
        closeExtraButton.addEventListener("click", async () => {

                try {
                const tabs = await chrome.tabs.query({})
                const limit = parseInt(globalLimitInput.value, 10) || 6
                
                if (tabs.length > limit) {
                    const extraTabs = tabs.slice(limit)
                    await chrome.tabs.remove(extraTabs.map(t => t.id))
                    
                    if (status) {
                        status.textContent = `🗑 Closed ${extraTabs.length} extra tabs!`
                        status.style.color = "#ff6b6b"
                        setTimeout(() => status.textContent = "", 2000)
                    }
                } else {
                    if (status) {
                        status.textContent = "✅ You're under the limit!"
                        status.style.color = "#77dd77"
                        setTimeout(() => status.textContent = "", 2000)
                    }
                }
                
                await updateTabInfo();
                await updateExtenTi();
            } catch (error) {
                console.error("Error closing tabs:", error)
                if (status) {
                    status.textContent = "❌ Error closing tabs"
                    status.style.color = "#ff6b6b"
                }
            }
        });
    }

  
    let suggestRedirect = document.getElementById("suggestRedirect")
    let forceRedirect = document.getElementById("forceRedirect")
    let addJunkSiteButton = document.getElementById("addJunkSiteButton")
    let junkSitesInput = document.getElementById("junkSitesInput")

    try {
        let result = await chrome.storage.sync.get(["suggestEnabled", "forceEnabled"])
        if (result.suggestEnabled) {
            suggestRedirect.checked = true
        }
        if (result.forceEnabled) {
            forceRedirect.checked = true
        }
    } catch (error) {
        console.error("Error loading settings:", error)
    }

    async function addJunkSite() {
        const newUrl = junkSitesInput.value.trim()
        if (!newUrl) {
            console.log("No URL entered")
            return;
        }

        if (!junkSites.includes(newUrl)) {
            junkSites.push(newUrl)
            

            await chrome.storage.sync.set({ junkSites: junkSites })
            
            const tabs = await chrome.tabs.query({})
            for (const tab of tabs) {
                try {
                    await chrome.tabs.sendMessage(tab.id, { 
                        action: "updateJunkSites", 
                        junkSites: junkSites 
                    })
                } catch (e) {

                }
            }
            
            console.log("Added junk site:", newUrl)
            console.log("Updated junk sites list:", junkSites)
            
            updateJunkSitesDropdown()
        } else {
            console.log("URL already exists in the list")
        }
        
        junkSitesInput.value = ""
    }

    if (addJunkSiteButton) {
        addJunkSiteButton.addEventListener("click", addJunkSite)
    }

    if (suggestRedirect) {
        suggestRedirect.addEventListener("change", async () => {
            try {
                if (suggestRedirect.checked) {
                    await chrome.storage.sync.set({ suggestEnabled: true })
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    chrome.tabs.sendMessage(tab.id, { action: "enableSuggest" })
                    console.log("suggest option enabled")
                } else {
                    await chrome.storage.sync.set({ suggestEnabled: false })
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    chrome.tabs.sendMessage(tab.id, { action: "disableSuggest" })
                    console.log("suggest option disabled")
                }
            } catch (error) {
                console.error("Error handling suggest option:", error)
            }
        });
    }

    if (forceRedirect) {
        forceRedirect.addEventListener("change", async () => {
            try {
                if (forceRedirect.checked) {
                    await chrome.storage.sync.set({ forceEnabled: true })
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    chrome.tabs.sendMessage(tab.id, { action: "enableForce" })
                    console.log("force option enabled")
                } else {
                    await chrome.storage.sync.set({ forceEnabled: false })
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    chrome.tabs.sendMessage(tab.id, { action: "disableForce" })
                    console.log("force option disabled")
                }
            } catch (error) {
                console.error("Error handling force option:", error)
            }
        })
    }
})

async function updateExtenTi() {
    const extenTi = document.getElementById("exten-ti");
    const tabs = await chrome.tabs.query({});
    const savedData = await chrome.storage.local.get(["globalLimit"]);
    const globalLimit = savedData.globalLimit || 6;
    
    let contnt;
    
    if (tabs.length > globalLimit) {
        contnt = `
            <img src="emoji-sad-simple-468-svgrepo-com.svg" alt="sad emoji" width="50" height="50">
            <h1>We get it. You have ${tabs.length} tabs open</h1>
            <h6>But having too many tabs open can hurt your productivity. Your limit is ${globalLimit} tabs. Please close some tabs to continue.</h6>
        `;
    } else {
        contnt = `
            <img src="emoji-happy-simple-460-svgrepo-com.svg" alt="happy emoji" width="50" height="50">
            <h1>You're doing great! Stay focused</h1>
            <h6>You currently have ${tabs.length} tabs open, which is within your limit of ${globalLimit}. Keep up the good work!</h6>
        `;
    }
    
    if (extenTi) {
        extenTi.innerHTML = contnt;
    }
}
