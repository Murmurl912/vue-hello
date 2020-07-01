import axios from 'axios'

export class Hbase {
    host = "localhost"
    port = "8086"

    constructor(host, port) {
        this.port = port
        this.host = host
    }

    url() {
        return "http://" + this.host + ":" + this.port
    }

    connect(response, error) {
        axios.get(this.url() + "/status/cluster")
            .then(function (res) {
                response(res)
            })
            .catch(function (err) {
                error(err)
            })
    }

    count(response, error) {
        axios.get(this.url() + "/school:student/*?column=profile:number")
            .then(function (res) {
                response(res)
            })
            .catch(function (err) {
                error(err)
            })
    }

    get(rowkey, response, error) {
        axios.get(this.url() + "/school:student/" + rowkey)
            .then(function (res) {
                let data = Hbase.this.decode(res.data)
                response(data)
            })
            .catch(function (err) {
                error(err)
            })
    }

    search(search_key, response, error) {

        let scanner = "<Scanner>\n" +
            "    <filter>\n" +
            "        {\n" +
            "            \"type\": \"ValueFilter\",\n" +
            "            \"op\": \"EQUAL\",\n" +
            "            \"comparator\": \n" +
            "                {\n" +
            "                    \"type\": \"SubstringComparator\",\n" +
            "                    \"value\": \"" + search_key + "\"\n" +
            "                }\n" +
            "        }\n" +
            "    </filter>\n" +
            "</Scanner>"
        console.log("scanner: ", scanner)

        axios.put(
            this.url() + "/school:student/scanner",
            scanner,
            {
                    headers: {
                        "content-type": "text/xml",
                        "accept": "application/json"
                    }
            })
            .then(function (res) {
                let url = res.headers.location
                console.log("search result location: ", url)
                return axios.get(url)
            })
            .then(function (res) {
                console.log("result data: ", res)
                let rows = res.data["Row"]
                let keys = []
                rows.forEach((row)=>{
                    let key = atob(row["key"])
                    keys.push(key)
                })
                response(keys)
            })
            .catch(function (err) {
                console.log("error: ", err)
                error(err)
            })
    }

    fetch(keys, response, error) {
        let self = this
        let links = []
        keys.forEach((key) => {
            let link = this.url() + "/school:student/" + key
            links.push(link)
        })
        console.log("fetch links: ", links)
        axios.all(links.map(link => axios.get(link)))
            .then(axios.spread(function (...res) {
                console.log("fetch result: ", res)
                let data = res.map((res) => {
                    console.log("extract rows from", res)
                    return res.data["Row"]
                }).filter((row)=>{
                    console.log("filter empty row", row)
                    return row.length === 1
                }).map((row) => {
                    console.log("extract single row")
                    return row[0]
                }).map((row) => {
                    return self.decode(row)
                })
                console.log("decoded data: ", data)
                response(data)
            }))
            .catch((err)=> {
                error(err)
            })
    }

    decode(row) {
        let number = ""
        let name = ""
        let age = ""
        let gender = ""
        let detail = {}
        let math = ""
        let chinese = ""
        let english = ""
        row["Cell"].forEach((cell) => {
            let column = atob(cell["column"])
            if (column === "profile:age") {
                age = atob(cell["$"])
            } else if (column === "profile:name") {
                name = atob(cell["$"])
            } else if (column === "profile:gender") {
                gender = atob(cell["$"])
            } else if (column === "profile:number") {
                number = atob(cell["$"])
            } else if (column === "math:grade") {
                math = atob(cell["$"])
            } else if (column === "english:grade") {
                english = atob(cell["$"])
            } else if (column === "chinese:grade") {
                chinese = atob(cell["$"])
            }
        })
        detail = row
        return {
            "number": number,
            "name": name,
            "age": age,
            "gender": gender,
            "math": math,
            "chinese": chinese,
            "english": english,
            "detail": detail
        }
    }

    unique(number, result) {
        axios.get(this.url() + "/school:student/" + number)
            .then(res => {
                console.log("unique test: ", res)
                result(false)
            })
            .catch(err => {
                console.log("unique test: ", err)
                result(true)
            })


    }

    insert(rows, response, error) {
        // let template = {
        //     number: "",
        //     name: "",
        //     age: "",
        //     gender: "",
        //     math: "score",
        //     chinese: "score",
        //     english: "score"
        // }

        let data = rows.map(row => {
            console.log("prepare row: ", row)
            let number = btoa(row["number"])
            let cells = []
            cells.push({
                column: btoa("profile:number"),
                $: btoa(row["number"])
            })
            if(row["name"] != null) {
                let cell = {
                    column: btoa("profile:name"),
                    $: btoa(row["name"])
                }
                cells.push(cell)
            }
            if(row["age"] != null) {
                let cell = {
                    column: btoa("profile:age"),
                    $: btoa(row["age"])
                }
                cells.push(cell)
            }
            if(row["gender"] != null) {
                let cell = {
                    column: btoa("profile:gender"),
                    $: btoa(row["gender"])
                }
                cells.push(cell)
            }
            if(row["math"] != null) {
                let cell = {
                    column: btoa("math:grade"),
                    $: btoa(row["math"])
                }
                cells.push(cell)
            }
            if(row["english"] != null) {
                let cell = {
                    column: btoa("english:grade"),
                    $: btoa(row["english"])
                }
                cells.push(cell)
            }
            if(row["chinese"] != null) {
                let cell = {
                    column: btoa("chinese:grade"),
                    $: btoa(row["chinese"])
                }
                cells.push(cell)
            }
            return {
                key: number,
                Cell: cells
            }
        })

        data = {
            Row: data
        }
        data = JSON.stringify(data)
        console.log("insert data: ", data)
        axios.put(this.url() + "/school:student/201721130000", data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            .then(response)
            .catch(error)
    }

    delete_all(numbers, response, error) {
        let links = numbers.map(number => {
            return this.url() + "/school:student/" + number
        })
        axios.all(links.map(link => axios.delete(link)))
            .then(axios.spread((...responsees)=>[
                response(responsees)
            ])).catch(error)
    }

    delete(number, response, error) {
        axios.delete(this.url() + "/school:student/" + number)
            .then(response)
            .catch(error)
    }

    delete_column(number, family, column, response, error) {
        axios.delete(this.url() + "/school:student/" + number + "/" + family + ":" + column)
            .then(response)
            .catch(error)
    }

    delete_family(number, family, response, error) {
        axios.delete(this.url() + "/school:student/" + number + "/" + family)
            .then(response)
            .catch(error)
    }


}