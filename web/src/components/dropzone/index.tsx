import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './style.css'

interface Props{
    onFileUploaded: (file: File) => void
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {
    const [selectedFileUrl, setSelectFileUrl] = useState('')

    const onDrop = useCallback(accptedFiles => {
        const file = accptedFiles[0]
        const fileUrl = URL.createObjectURL(file)
        setSelectFileUrl(fileUrl)
        onFileUploaded(file)
    },[onFileUploaded])
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*'
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />
            {
                selectedFileUrl
                    ? <img src={selectedFileUrl} alt="Point thumbnail" />
                    :(
                        <p>
                            <FiUpload />
                            Imagem do estabelecimento
                        </p>
                    )
            }
        </div>
    )
}

export default Dropzone