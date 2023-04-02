function postFormAsync ({ clearForm = false, event }: {
  clearForm?: boolean;
  event: Event;
}) {
  if (!(event.target instanceof HTMLFormElement)) {
    throw new Error("Event target is not a form");
  }
  const form = event.target;

  let targetUrl = form?.action;
  if (!targetUrl) {
    targetUrl = window.location.href;
  }

  const promise = new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", targetUrl, true);

    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        if (clearForm) {
          form.reset();
        }
        resolve(this.response);
      } else {
        // We reached our target server, but it returned an error
        reject(this.response);
      }
    };

    request.onerror = function () {
      // There was a connection error of some sort
      reject(this.response);
    };

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    function urlencodeFormData(fd: FormData){
      var s = '';
      function encode(s: string){ return encodeURIComponent(s).replace(/%20/g,'+'); }
      for(var pair of fd.entries()){
          if(typeof pair[1]=='string'){
              s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
          }
      }
      return s;
  }

    request.send(urlencodeFormData(new FormData(form))); // create FormData from form that triggered event
  });
  event.preventDefault();
  return promise;
}

function addPostFormEventListener (form: HTMLFormElement, { clearForm = false }: {
  clearForm?: boolean;
} = {}) {
  form.addEventListener("submit", (event) => {
    postFormAsync({ clearForm, event });
  });
}

globalThis.postFormAsync = postFormAsync;
globalThis.addPostFormEventListener = addPostFormEventListener;

customElements.define("xhr-form", class extends HTMLFormElement {
  connectedCallback () {
    addPostFormEventListener(this);
  }
});
