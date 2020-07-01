
const key_connection = "connection";
const key_record_count = "record_count"

export class Store {

    static get_connection() {
        let string = sessionStorage.getItem(key_connection)
        return JSON.parse(string)
    }

    static put_connection(connection) {
        sessionStorage.setItem(key_connection, JSON.stringify(connection))
    }

    static clear_connection() {
        sessionStorage.setItem(key_connection, null)
    }

    static put_record_count(record_count) {
        sessionStorage.setItem(key_record_count, JSON.stringify(record_count))
    }

    static get_record_count() {
        let string = sessionStorage.getItem(key_record_count)
        return JSON.parse(string)
    }

    static clear_record_count() {
        sessionStorage.setItem(key_record_count, null)
    }
}