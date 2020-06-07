import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import Dropzone from '../../components/dropzone'


import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
    id: number
    title: string
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedUf, setselectedUf] = useState('0')
    const [selectedCity, setselectedCity] = useState('0')
    const [selectedPosition, setselectedPosition] = useState<[number, number]>([0,0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords
            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get('items').then(resp => {
            setItems(resp.data)     
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(resp => {
            const ufInitial = resp.data.map(uf => uf.sigla)
            setUfs(ufInitial)
        })
    }, [])

    useEffect(() => {
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/microrregioes`)
            .then(resp => {
            const cityNames = resp.data.map(city => city.nome)
            setCities(cityNames)
        })
    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value
        setselectedUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value
        setselectedCity(city)
    }

    function handleClickMap(event: LeafletMouseEvent){

        setselectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value })
    }

    function handleSelectItem(id: number){
        const alredySelected = selectedItems.findIndex(item => item === id)
        if (alredySelected >=0) {
            const filtredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filtredItems)
        } else {
            setSelectedItems([ ...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()
        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [ latitude, longitude ] = selectedPosition
        const items = selectedItems

        const data = new FormData()
        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('city', city)
        data.append('uf', uf)
        data.append('items', items.join(','))
        if (selectedFile) {
            data.append('image', selectedFile)
        }

        console.log(data)
        await api.post('points', data)
        alert('Cadastrado com sucesso')
        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={ logo } alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/> ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label> 
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label> 
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">whatsapp</label> 
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleClickMap}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label> 
                            <select 
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label> 
                            <select 
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coelta</h2>
                        <span>Selecione um ou mais intens a baixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={ item.title }/>
                                <span>{ item.title }</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint