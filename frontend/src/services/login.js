import axios from 'axios'

const URL = '/api/login/'

export const login = (credentials) => {
    return axios
    .post(URL, credentials)
    .then(res => res.data)
    .catch(error => {
        throw new Error(error.response.data.error);
    })
} 


    