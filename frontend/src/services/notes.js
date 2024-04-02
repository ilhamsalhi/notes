import axios from 'axios'

const URL = '/api/notes/'

export const getAll = () => {
    console.log("fetching data from server...")
   return (
    axios.get(URL)
        .then((response) => {
            console.log("data fetched from the server")
            console.log(response.data);
            return response.data;
        })
        .catch(error => {
            console.log(error)
            throw new Error(error.message)
        })
   )
}

export const create = newObject => {
    console.log("adding data to the server...")
    return (
        axios.post(URL, newObject)
        .then((response) => {
            console.log("data added to the server successfully")
            console.log(response.data)
            return response.data;
        })
        .catch(error => {throw new Error(error.message)})
    )
}

export const update = (id, newObject) => {
    console.log("updating data in the server...")
    return (
        axios.put(`${URL}${id}`, newObject)
        .then((response) => {
            console.log("data updated successfully")
            console.log(response.data)
            return response.data;
        })
        .catch(error => {throw new Error(error.message)})
    )
}

export const del = (id) => {
    console.log("deleting data in the server...")
    console.log()
    return (
        axios.delete(`${URL}${id}`)
        .then((response) => {
            console.log("data deleted successfully")
            console.log(response.data)
            return response.data;
        })
        .catch(error => {throw new Error(error.message)})
    )
}