import icons from "url:../../img/icons.svg"; // Parcel 2

export default class View {
    _data;

    /**
     * Render the data (obj) to the DOM
     * @param {Object | Array<Object>} data The data to be rendered (e.g. model.state.recipe)
     * @param {boolean} [render=true] If false, create a markup string instead of rendering to the DOM
     * @returns {void | string} Return a markup string if render=false
     * @this {Object} View instance
     * @author Jonas Schemedtmann & Bayu
     * @todo Finish implementation
     */
    render(data, render = true) {
        if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data;
        const markup = this._generateMarkup();
        if (!render) return markup;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    update(data) {
        this._data = data;
        const newMarkup = this._generateMarkup();
        const newDOM = document.createRange().createContextualFragment(newMarkup);
        const newElements = Array.from(newDOM.querySelectorAll("*"));
        const curElements = Array.from(this._parentElement.querySelectorAll("*"));
        // console.log(newElements); // DEL

        newElements.forEach((newEl, i) => {
            const curEl = curElements[i];

            /* 1) Updating textContent.
            a. Mechanism: Find node/element with its firstChild is a Text node.
            b. Problem and Fix: There would be changed node which has firstChild that has:
            - "Whitespace" Text node (when you press Enter for indetation in HTML).
            - Any node which has nodeValue of null (like Element nodes),
            which could pass the if statement (because String(null) = "null").

            So the optional chaining in curEl.firstChild?.nodeValue?.trim() is enough to unpass the if statement
            if that's the element.firstChild is not the targeted Text node.   
            */
            if (!newEl.isEqualNode(curEl) && curEl.firstChild?.nodeValue?.trim() !== "") {
                curEl.textContent = newEl.textContent;
            }

            // 2) Updating attributes.
            if (!newEl.isEqualNode(curEl)) {
                Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
            }
        });
    }

    _clear() {
        this._parentElement.innerHTML = "";
    }

    renderSpinner() {
        const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>`;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    renderError(message = this._errorMessage) {
        const markup = `
            <div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
            </div>`;

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    renderMessage(message = this._message) {
        const markup = `
            <div class="message">
                <div>
                  <svg>
                    <use href="${icons}#icon-smile"></use>
                  </svg>
                </div>
                <p>${message}</p>
            </div>`;

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }
}
