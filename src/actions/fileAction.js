import axios from "axios";
export const PICK_FILE = "PICK_FILE";
export const UNPICK_FILE = "UNPICK_FILE";
export const DELETE_FILE = "DELETE_FILE";
export const ADD_FILE = "ADD_FILE";
export const UPDATE_FILE = "UPDATE_FILE";

export const GET_IMG_REQUEST = "GET_IMG_REQUEST";
export const GET_IMG_SUCCESS = "GET_IMG_SUCCESS";
export const GET_IMG_FAILURE = "GET_IMG_FAILURE";

export const addFile = (file) => {
    return {
        type: ADD_FILE,
        payload: file
    };
};
export const deleteFile = (id) => {
    return {
        type: DELETE_FILE,
        payload: id
    };
};
export const pickFile = (id) => {
    return {
        type: PICK_FILE,
        payload: id
    };
};
export const unPickFile = () => {
    return {
        type: UNPICK_FILE
    };
};
export const updateFile = (newThisFile) => {
    return {
        type: UPDATE_FILE,
        payload: newThisFile
    };
};

export const addFileAction = (calc) => {
    return (dispatch) => {
        let config = {
            headers: {'Content-Type': 'application/json'},
            data: {
                calc: calc
            },
        };
        axios.post('/orders', config)
            .then(response => {
                const data = response.data
                dispatch(addFile(data))
                // dispatch(unPickFile())
                dispatch(pickFile(data.id))

            })
            .catch(error => {
                console.log(error);
            })
    }
}

export const deleteFileAction = (id) => {
    return (dispatch) => {
        let config = {
            headers: {'Content-Type': 'application/json'},
            data: {
                id: id
            },
        };
        axios.delete('/orders', config)
            .then(response => {
                const data = response.data
                console.log(data);
                if(data.status === "ok"){
                    dispatch(deleteFile(data.id))
                }
            })
            .catch(error => {
                console.log(error);
            })
    }
}

export const updateFileAction = (thisFile, parameter, parameter2, parameter3, value, value2, value3, parameter4=null, value4=null) => {
    return (dispatch) => {
        let config = {
            id: thisFile.id,
            parameter: parameter,
            parameter2: parameter2,
            parameter3: parameter3,
            parameter4: parameter4,
            value: value,
            value2: value2,
            value3: value3,
            value4: value4,
        };
        if(parameter === "paper"){
            config = {
                id: thisFile.id,
                parameter: parameter,
                value: value,
            }
        }
        console.log(config);
        axios.put('/orders', config)
            .then(response => {
                if(response.data.status === "ok"){
                    console.log(response.data);
                    // let thisFileUpdated = thisFile
                    let thisFU = response.data.thisFile
                    // Object.defineProperty(thisFile, parameter, {
                    //     value: value,
                    //     writable: true
                    // });
                    // Object.defineProperty(thisFile, parameter2, {
                    //     value: value2,
                    //     writable: true
                    // });
                    // Object.defineProperty(thisFile, parameter3, {
                    //     value: value3,
                    //     writable: true
                    // });
                    // if(parameter4){
                    //     Object.defineProperty(thisFile, parameter4, {
                    //         value: value4,
                    //         writable: true
                    //     });
                    // }
                    // Object.defineProperty(thisFile, "x", {
                    //     value: response.data.x,
                    //     writable: true
                    // });
                    // Object.defineProperty(thisFile, "y", {
                    //     value: response.data.y,
                    //     writable: true
                    // });
                    // Object.defineProperty(thisFile, "format", {
                    //     value: response.data.format,
                    //     writable: true
                    // });
                    // Object.defineProperty(thisFile, "price", {
                    //     value: response.data.price,
                    //     writable: true
                    // });
                    dispatch(updateFile(thisFU))
                } else {
                    console.log(response.data);
                    dispatch(deleteFile(thisFile.id))
                }
            })
            .catch(error => {
                console.log(error);
            })
    }
}

export const startDownloadImg = () => {
    return {
        type: GET_IMG_REQUEST
    };
};
export const successDownloadImg = (img) => {
    return {
        type: GET_IMG_SUCCESS,
        payload: img

    };
};
export const errorDownloadImg = (err) => {
    return {
        type: GET_IMG_FAILURE,
        payload: err
    };
};

export const DownloadImgAction = (thisFile) => {
    return (dispatch) => {
        dispatch(startDownloadImg())
        console.log("DownloadImgAction (after start");
        if(thisFile.url.img){
            const img = new Image();
            img.src = thisFile.url.url;
            img.onload = (event) => {
                let imgP = {
                    width: event.target.naturalWidth,
                    height: event.target.naturalHeight,
                    src: event.target.src
                }
                console.log(imgP);
                dispatch(successDownloadImg(imgP))
                console.log("DownloadImgAction (after success");
            }
            img.onerror = (error) => {
                dispatch(errorDownloadImg(error))
            }
        } else {
            // const loadingTask = pdfjsLib.getDocument(thisFile.url.url);
            // loadingTask.promise.then(loadedPdf => {
            //     let imgP = {
            //         pdf: loadedPdf
            //     }
            //     dispatch(successDownloadImg(imgP))
            // }, function (reason) {
            //     dispatch(errorDownloadImg(reason))
            // });
            // pdfjsLib.getDocument(thisFile.url.url).then((pdf, err) => {
            //     if(err){
            //         dispatch(errorDownloadImg(err))
            //     } else {
            //         let imgP = {
            //             pdf: pdf
            //         }
            //         dispatch(successDownloadImg(imgP))
            //     }
            // })
            dispatch(successDownloadImg(null))
            console.log("DownloadImgAction (after success");
        }
    }
}