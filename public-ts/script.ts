function urlencodeFormData(fd: FormData) {
  let s = "";
  function encode(s: string) {
    return encodeURIComponent(s).replace(/%20/g, "+");
  }
  const formData: [string, string][] = [];
  fd.forEach((value, key) => {
    if (value instanceof File) {
      formData.push([key, value.name]);
    } else {
      formData.push([key, value]);
    }
  });
  for (const [key, value] of formData) {
    s += (s ? "&" : "") + encode(key) + "=" + encode(value);
  }
  return s;
}

const xhrOnSubmit = (event: SubmitEvent) => {
  console.log("Form submitted");
  const form: HTMLFormElement | null =
    event.target instanceof HTMLFormElement ? event.target : null;
  if (form == null) {
    console.error("Event target of form listener is not a form!");
    return;
  }
  let baseUrl = form.action;
  if (baseUrl == null || baseUrl === "") {
    baseUrl = window.location.href;
  }

  const requestUrl = new URL(baseUrl, window.location.href);

  const shouldClear = form.getAttribute("data-clear-form") === "true";

  // Decide on encoding
  const formenctype =
    event.submitter?.getAttribute("formenctype") ??
    event.submitter?.getAttribute("formencoding");
  const enctype =
    formenctype ??
    form.getAttribute("enctype") ??
    form.getAttribute("encoding") ??
    "application/x-www-form-urlencoded";

  // Decide on method
  let formMethod =
    event.submitter?.getAttribute("formmethod") ??
    form.getAttribute("method")?.toLowerCase() ??
    "get";

  const formData = new FormData(form);

  // Encode body
  let body: BodyInit | null = null;
  if (formMethod === "get") {
    requestUrl.search = new URLSearchParams(
      urlencodeFormData(formData)
    ).toString();
  } else if (formMethod === "post") {
    if (enctype === "application/x-www-form-urlencoded") {
      body = urlencodeFormData(formData);
    } else if (enctype === "multipart/form-data") {
      body = formData;
    } else if (enctype === "text/plain") {
      let text = "";
      // @ts-ignore - FormData.entries() is not in the TS definition
      for (const element of formData.keys()) {
        text += `${element}=${JSON.stringify(formData.get(element))}\n`;
      }
    } else {
      throw new Error(`Illegal enctype: ${enctype}`);
    }
  } else if (formMethod === "dialog") {
    // Allow default behavior
    return;
  } else {
    throw new Error(`Illegal form method: ${formMethod}`);
  }

  // Send request
  const requestOptions: RequestInit = {
    method: formMethod,
    headers: {
      "Content-Type": enctype,
    },
  };
  if (body != null && formMethod === "post") {
    requestOptions.body = body;
  }
  const response = fetch(baseUrl, requestOptions).then((response) => {
    if (shouldClear) {
      form.reset();
    }
    if (response.ok) {
      form.dispatchEvent(
        new CustomEvent("xhr-form-success", {
          detail: response,
        })
      );
    } else {
      form.dispatchEvent(
        new CustomEvent("xhr-form-failure", {
          detail: response,
        })
      );
    }
    return response;
  });

  event.preventDefault();
};

customElements.define(
  "xhr-form",
  class extends HTMLFormElement {
    constructor() {
      console.log("Form constructed");
      super();
    }

    connectedCallback() {
      this.addEventListener("submit", xhrOnSubmit);
    }

    disconnectedCallback() {
      this.removeEventListener("submit", xhrOnSubmit);
    }
  },
  { extends: "form" }
);
