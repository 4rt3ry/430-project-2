
type ResponseHandler = ((responseBody: object) => void) | undefined;

const handleError = (message: string): void => {
    const errorContainer = document.querySelector("#loginErrors") as HTMLElement;
    const errorTag = errorContainer.querySelector(".errorMessage") as HTMLElement;
    errorContainer.classList.remove("hidden");
    errorTag.innerText = message;
}

const clearError = () => {
    const errorContainer = document.querySelector("#loginErrors") as HTMLElement;
    const errorTag = errorContainer.querySelector(".errorMessage") as HTMLElement;
    errorContainer.classList.add("hidden");
    errorTag.innerText = "";
}

const send = async (
    url: string,
    body: object | null,
    handler: ResponseHandler,
    method: string
) => {

    let options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    const responseBody = await response.json();

    // handle any redirects
    if (responseBody.redirect) {
        window.location = responseBody.redirect;
    }

    // handle any errors
    if (responseBody.error) {
        handleError(responseBody.error);
    }

    if (handler) handler(responseBody);

    return responseBody;
}

const sendPost = (
    url: string,
    data: object,
    handler: ResponseHandler
) => send(url, data, handler, 'POST');

const sendHead = (
    url: string,
    handler: ResponseHandler
) => send(url, null, handler, 'HEAD');

const sendGet = async (
    url: string,
    handler: ResponseHandler
) => send(url, null, handler, 'GET');

// const sendGetAsync = async (
//     url: string,
//     handler: ResponseHandler
// ) => await send(url, data, handler, 'GET');

const sendDelete = (
    url: string,
    data: object,
    handler: ResponseHandler
) => send(url, data, handler, 'DELETE');

export {
    handleError,
    clearError,
    sendGet,
    sendPost,
    sendHead,
    sendDelete
}