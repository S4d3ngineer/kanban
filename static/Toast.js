export default class Toast extends HTMLElement {
    constructor(type, message) {
        super();
    
        this._class;
        this._title;
        switch(type) {
            case "success":
                this._class = "success";
                this._title = "Success";
                break;
            case "failure":
                this._class = "failure";
                this._title = "Error";
                break;
            default:
                throw new Error("Input of type is incorrect. Should be 'success' or 'failure'.");
        };
        this._message = message;
        
        this._shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const toastElement = document.createElement("div");
        toastElement.classList.add("toast", this._class);
        setTimeout(() => toastElement.classList.add("show"), 100)

        const titleParagraph = document.createElement("p");
        titleParagraph.innerText = this._title;
        toastElement.appendChild(titleParagraph);

        const messageParagraph = document.createElement("p");
        messageParagraph.innerText = this._message;
        toastElement.appendChild(messageParagraph);

        const style = document.createElement("style");
        style.textContent = `
            .toast {
                position: relative;
                font-family: Roboto, sans-serif;
                padding: 10px 15px;
                margin-bottom: 10px;
                border: none;
                border-radius: 5px;
                width: 250px;
                cursor: pointer;
                transform: translateX(110%);
            }

            .toast.show {
                transition: .1s;
                transform: translateX(0);
            }

            .toast p {
                font-size: 0.8rem;
                margin: 0px;
            }

            .toast p:first-child {
                font-size: 1rem;
                font-weight: bold;
            }
            
            .toast::after {
                content: "\u00D7";
                position: absolute;
                top: 0px;
                right: 7px;
            }
            
            .success  {
                color: black;
                background-color: PaleGreen;
            }
            
            .failure {
                color: #f8f9fa;
                background-color: LightCoral;
            }
        `;

        this._shadow.appendChild(toastElement);
        this._shadow.appendChild(style);
    }
}

customElements.define("toast-notification", Toast);