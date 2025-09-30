let junkSites = [
    "https://egypt.burgerking.delivery/",
    "https://www.mcdelivery.eg/eg/",
    "https://egypt.kfc.me/en/",
    "https://www.papajohns.com/",
    "https://www.wendys.com/en-gb/",
    "https://www.papajohnsegypt.com/",
    "https://www.dominos.co.uk/",
    "https://www.dunkindonuts.com/",
    "https://www.fiveguys.com/online-ordering/",
    "https://fiveguys.co.uk/",
    "https://www.burgerking.co.uk/store-locator/address",
    "https://www.shakeshack.com.my/",
    "https://www.papajohnsegypt.com/",
    "https://hotlines.tel/en/sps/",
    "https://egypt.kfc.me/en/home"  
]

let healthySites = [
    "https://prepkitchen.co.uk/",
    "https://detoxkitchen.co.uk/",
    "https://www.macromealsuk.co.uk/",
    "https://www.frive.co.uk/",
    "https://www.treatsegypt.com/",
    "https://wagbafit.com/",
    "https://www.proteinbox-egypt.com/menu",
    "https://chefboxeg.com/"
]

let suggestEnabled = false
let forceEnabled = false
let originalHtml = ''
let originalHead = ''

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", saveOriginalContent)
} else {
    saveOriginalContent()
}

function saveOriginalContent() {
    originalHtml = document.body.innerHTML
    originalHead = document.head.innerHTML
}

chrome.storage.sync.get(["suggestEnabled", "forceEnabled", "junkSites"]).then((result) => {

    if (result.junkSites) {
        junkSites = result.junkSites
        console.log("Loaded saved junk sites:", junkSites)
    }
    
    if (result.suggestEnabled) {
        suggestEnabled = true
        suggestOption()
    }
    if (result.forceEnabled) {
        forceEnabled = true
        forceRedirectOption()
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "enableSuggest":
            suggestEnabled = true
            suggestOption()
            sendResponse({ success: true})
            break
        case "disableSuggest":
            suggestEnabled = false
            restoreOriginalPage()
            sendResponse({ success: true})
            break
        case "enableForce":
            forceEnabled = true
            forceRedirectOption()
            sendResponse({ success: true})
            break
        case "disableForce":
            forceEnabled = false
            sendResponse({ success: true})
            break
        case "updateJunkSites":
            junkSites = request.junkSites
            console.log("Updated junk sites list:", junkSites)

            if (suggestEnabled) {
                suggestOption()
            }
            sendResponse({ success: true})
            break
    }
})

let pageHtml = () => {
    let optionsHtml = healthySites.map(site => `<option class="options" value="${site}">${site}</option>`).join('');
    return `
    <head> 
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Merienda:wght@300..900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>

    <body>
        <div id="container"> 
            <h1>🍔🍟 Hold up! Before you indulge in that junk food... 🍕🌭 </h1>
                <form id="myForm">  
                    <select id="selectHealthySite">
                        <option>Choose a healthy site</option>
                        ${optionsHtml}
                    </select>
                    <div class="icon-container">
                        <i class=" fa-solid fa-caret-down"></i>
                    </div>
            </form>
            <img class="healthy-image" src="${chrome.runtime.getURL('healthyOr.jpeg')}">
        </div>
    </body>
    `   
}

let pageCss = () => {
    return `
        <style>
        body {
            background: #f8f7fc;
            color: red;
            justify-content: center;
            text-align: center;
            font-family: "Merienda", cursive;
            font-weight: 600;
        }

        h1 {
            drop-shadow: 2px 4px 6px #cf0000ff;
            color: #cf0000ff
        }   

        .healthy-image {
            height: 60vh;
            margin-top: 110px;
            margin-bottom: 0;
        }

        #selectHealthySite {
            border: 1px solid #black;
            background: #cf0000ff;
            color: white;
            font-family: "Merienda", cursive;
            font-weight: 600;
            text-align: center;
            font-size: .8rem;
            appearance: none;
            padding: 8px 30px 8px 15px;
            border-radius: 40px;

            
        }

        #selectHealthySite .icon-container {
            width: 50px;
            height: 100%;
            position: absolute;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #023ca9;
            
        }

        .icon-container {
            font-size: 10px;
            color: black;
        }

        </style>
    `
}

function suggestOption() {
        if (junkSites.some(site => window.location.href.startsWith(site))) {
        document.head.innerHTML = pageCss();
        document.body.innerHTML = pageHtml();
        
        document.getElementById("selectHealthySite").addEventListener("change", function(e) {
            let url = e.target.value
            if (url && url !== "Choose a healthy site") {
                window.location.href = url
            }
    })
    }
}

function forceRedirectOption() { 
     if (junkSites.some(site => window.location.href.startsWith(site))) {
        let randomHealthySite = healthySites[Math.floor(Math.random() * healthySites.length)]
        window.location.replace(randomHealthySite)
     }

}

function restoreOriginalPage() {
    if (originalHtml && originalHead) {
        document.head.innerHTML = originalHead;
        document.body.innerHTML = originalHtml;
    }
}







