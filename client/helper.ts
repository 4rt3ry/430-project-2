
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

const send = (
    url: string,
    body: object,
    handler: ResponseHandler,
    method: string
) => {
    const response = fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    response.then(response => {
        response.json().then(responseBody => {

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
        })
    })
}

const sendPost = (
    url: string,
    data: object,
    handler: ResponseHandler
) => send(url, data, handler, 'POST');

const sendGet = async (
    url: string,
    handler: ResponseHandler
) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

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
    sendDelete
}