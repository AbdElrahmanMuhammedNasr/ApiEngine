const axios = require('axios');

async function createGetRequest(currentStage, requirementNextStage) {
    let {url, currentInput = null} = currentStage;
    if (currentInput !== null) {
        const {loopedValues = null} = currentInput;
        if (loopedValues !== null) {
            for (const value of loopedValues) {
                const response = await axios({
                    method: 'get',
                    url: url.replaceAll("{id}", value),
                    headers: createRequestAuthorizationHeaders(currentInput)
                });
                console.log("start ---------" + url + "-----------")
                console.log(response.data)
                console.log("end ---------" + url + "-----------")
            }
            return;
        }
    }
    const response = await axios({method: 'get', url: url, headers: createRequestAuthorizationHeaders(currentInput)});
    console.log("start ---------" + url + "-----------")
    console.log(response.data)
    console.log("end ---------" + url + "-----------")
    return generateNextMetaDataInput(currentInput, response, requirementNextStage);

}


function generateNextMetaDataInput(currentInput, response, requirementNextStage) {
    let next = {}
    for (const requirement of requirementNextStage) {
        const {type, value, getFromPrevious} = requirement;
        let loopIterations;
        if (getFromPrevious === true && type === "token") {
            const {token = null} = currentInput
            next.token = token
        }
        if (getFromPrevious === true && type === "header") {
            const {header = null} = currentInput
            if(header){
                next.header = header
            }else {
                const {name} = requirement;
                next.header = name+"&"+  getValueByPath(response.data,  value)
            }
        }
        if (getFromPrevious === false && type === "isRequestLoop") {
            next.isRequestLoop = value
        }
        if (getFromPrevious === false && type === "loopTime") {
            if (value === true) {
                loopIterations = value === 'ALL' ? response.data.length : value;
            } else {
                loopIterations = 1;
            }
            next.loopTime = loopIterations;
        }
        if (getFromPrevious === false && type === "loopedName") {
            next.loopedValues = response.data.map(d => d[value]).slice(0, loopIterations);
        }
    }

    return next;

}

function createRequestAuthorizationHeaders(currentInput) {
    const {token = null , header= null} = currentInput
    let headers={}
    if (token != null) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (header) {
        const [headerName, headerValue] = header.split("&");
        if (headerName && headerValue) {
            headers[headerName] = headerValue;
        }
    }

    return headers

}

function getValueByPath(obj, path) {
    return path
        .replace(/\[(\w+)\]/g, '.$1') // Convert array notation to dot notation
        .split('.')
        .reduce((acc, part) => acc && acc[part], obj); // Traverse the object
}

module.exports = {
    createGetRequest,
};

