
import React, { useEffect, useState } from 'react'

import Modal from './Modal/Modal'
import Input from './utilities/Input'
import Card from './utilities/Card'
import DateTimePicker from './utilities/DateTimePicker'
import TextArea from './utilities/TextArea'
import moment from 'moment/moment'
import ImageInputPills from './utilities/ImageInputPills'
import { v4 as uuidv4 } from 'uuid'

import {
    ensureUrlSafety,
    getExtension,
    removeQueryParameters
} from './utilities/utilityFunctions'

import { getPresignedUrl } from '../Actions/UploadFilesActions'

import {
    getProjectById,
    createProject,
    updateProject
} from '../Actions/projectActions'

import { toast } from 'react-hot-toast'

function CreateProject(props) {
    const {
        onClose,
        message,
        disabled = false,
        mode = 'Create',
        projectId,
        toggleReload,
        setToggleReload
    } = props

    // =====================================================
    // BASIC PROJECT DETAILS
    // =====================================================

    const [projectName, setProjectName] = useState('')
    const [address, setAddress] = useState('')
    const [projectStartDate, setProjectStartDate] = useState('')
    const [projectEndDate, setProjectEndDate] = useState('')
    const [description, setDescription] = useState('')

    // =====================================================
    // IMAGES
    // =====================================================

    const [files, setFile] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [imagesToDelete, setImagesToDelete] = useState([])

    // =====================================================
    // PDFS
    // =====================================================

    const [pdfFiles, setPdfFiles] = useState([])
    const [existingPdfs, setExistingPdfs] = useState([])
    const [pdfsToDelete, setPdfsToDelete] = useState([])

    // =====================================================
    // OTHER STATES
    // =====================================================

    const [projectImageId, setProjectImageId] = useState(uuidv4())
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [pageTitle] = useState(`${mode} Project`)
    const [dateError, setDateError] = useState('')

    // =====================================================
    // LOAD PROJECT IN EDIT MODE
    // =====================================================

    useEffect(() => {
        console.log('mode:', mode, 'projectId:', projectId)

        if (mode === 'Edit' && projectId) {
            getProject()
        } else {
            setLoading(false)
        }
    }, [mode, projectId])

    // =====================================================
    // NOTIFICATION
    // =====================================================

    const notification = (msg, type) => {
        toast[type](msg)
    }

    // =====================================================
    // GET PROJECT
    // =====================================================

    const getProject = async () => {
        try {
            setLoading(true)

            const res = await getProjectById(projectId)

            console.log('Project of id:', res)

            if (res?.status) {
                const project = res?.project || {}

                // Basic details
                setProjectName(project.name || '')
                setAddress(project.address || '')
                setProjectStartDate(project.start || '')
                setProjectEndDate(project.end || '')
                setDescription(project.description || '')

                // Existing images
                setExistingImages(
                    Array.isArray(project.images)
                        ? project.images
                        : []
                )

                // Project image folder ID
                setProjectImageId(
                    project.projectImagesId || uuidv4()
                )

                // =================================================
                // EXISTING PDFS
                // =================================================

                let oldPdfs = []

                if (Array.isArray(project.pdfs)) {
                    oldPdfs = project.pdfs.filter(Boolean)
                } else if (project.pdf) {
                    oldPdfs = [project.pdf]
                }

                oldPdfs = oldPdfs.slice(0, 3)

                setExistingPdfs(oldPdfs)
                setPdfsToDelete([])
            } else {
                notification(
                    'Unable to find project',
                    'error'
                )
            }
        } catch (error) {
            console.error('Get project error:', error)

            notification(
                'Unable to load project',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    // =====================================================
    // UPLOAD FILE
    // IMPORTANT:
    // Backend uploads file to Cloudinary and returns:
    // { url: "https://res.cloudinary.com/..." }
    //
    // We return that direct Cloudinary URL.
    // =====================================================

    const uploadFile = async (file, url) => {
        try {
            const res = await fetch(url, {
                method: 'PUT',
                body: file
            })

            if (!res.ok) {
                console.error(
                    'File upload failed:',
                    res.status,
                    res.statusText
                )

                return null
            }

            // Backend returns JSON containing direct Cloudinary URL
            const data = await res.json()

            console.log('Cloudinary upload response:', data)

            if (data?.url) {
                return {
                    response: res,
                    url: data.url
                }
            }

            console.error(
                'Upload succeeded but no final URL was returned.'
            )

            return null
        } catch (error) {
            console.error(
                'File upload error:',
                error
            )

            return null
        }
    }

    // =====================================================
    // VALIDATE DATES
    // =====================================================

    const validateDates = (start, end) => {
        if (!start || !end) {
            setDateError(
                'Please select both start and end dates.'
            )

            return false
        }

        if (moment(end).isBefore(moment(start))) {
            setDateError(
                'End date cannot be earlier than start date.'
            )

            return false
        }

        setDateError('')

        return true
    }

    // =====================================================
    // UPLOAD PDF
    // =====================================================

    const uploadPdf = async (pdf, index) => {
        const originalName =
            pdf.name || 'project-document.pdf'

        const fileNameWithoutExtension =
            originalName.replace(
                /\.pdf$/i,
                ''
            )

        const parsedFileName =
            ensureUrlSafety(
                fileNameWithoutExtension
            )

        const parsedProjectName =
            ensureUrlSafety(
                projectName
            )

        const uniqueId = uuidv4()

        const key =
            `projects/${projectImageId}/pdf/${uniqueId}_${index + 1}_${parsedFileName}_${parsedProjectName}.pdf`

        console.log(
            'Uploading PDF with key:',
            key
        )

        const tempUrl =
            await getPresignedUrl({
                key
            })

        if (!tempUrl || !tempUrl.url) {
            throw new Error(
                `Failed to get upload URL for ${pdf.name}`
            )
        }

        const uploadResult =
            await uploadFile(
                pdf,
                tempUrl.url
            )

        if (
            !uploadResult ||
            !uploadResult.url
        ) {
            throw new Error(
                `Failed to upload PDF ${pdf.name}`
            )
        }

        console.log(
            'Final Cloudinary PDF URL:',
            uploadResult.url
        )

        // IMPORTANT:
        // Save direct Cloudinary URL,
        // NOT backend /api/local-files URL.
        return removeQueryParameters(
            uploadResult.url
        )
    }

    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        setError('')

        // Validate dates
        if (
            !validateDates(
                projectStartDate,
                projectEndDate
            )
        ) {
            setLoading(false)
            return
        }

        try {
            // =================================================
            // CREATE PROJECT
            // =================================================

            if (mode === 'Create') {
                const imagesUrl = []

                // ---------------------------------------------
                // UPLOAD IMAGES
                // ---------------------------------------------

                await Promise.all(
                    files.map(async (file) => {
                        const parsedFileName =
                            ensureUrlSafety(
                                file.name
                            )

                        const parsedExtension =
                            getExtension(
                                file.name
                            )

                        const parsedProjectName =
                            ensureUrlSafety(
                                projectName
                            )

                        const key =
                            `projects/${projectImageId}/images/${parsedFileName}_${parsedProjectName}.${parsedExtension}`

                        const tempUrl =
                            await getPresignedUrl({
                                key
                            })

                        if (
                            !tempUrl ||
                            !tempUrl.url
                        ) {
                            throw new Error(
                                `Failed to get upload URL for ${file.name}`
                            )
                        }

                        const uploadResult =
                            await uploadFile(
                                file.file,
                                tempUrl.url
                            )

                        if (
                            !uploadResult ||
                            !uploadResult.url
                        ) {
                            throw new Error(
                                `Failed to upload image ${file.name}`
                            )
                        }

                        // IMPORTANT:
                        // Save direct Cloudinary URL
                        const fileUrl =
                            removeQueryParameters(
                                uploadResult.url
                            )

                        console.log(
                            'Final Cloudinary image URL:',
                            fileUrl
                        )

                        imagesUrl.push(
                            fileUrl
                        )
                    })
                )

                // ---------------------------------------------
                // VALIDATE PDF COUNT
                // ---------------------------------------------

                if (pdfFiles.length > 3) {
                    throw new Error(
                        'A project can have maximum 3 PDFs.'
                    )
                }

                // ---------------------------------------------
                // UPLOAD PDFS
                // ---------------------------------------------

                const uploadedPdfResults =
                    await Promise.all(
                        pdfFiles.map(
                            (pdf, index) =>
                                uploadPdf(
                                    pdf,
                                    index
                                )
                        )
                    )

                // ---------------------------------------------
                // FINAL PROJECT OBJECT
                // ---------------------------------------------

                const finalProject = {
                    name: projectName,
                    title: projectName,
                    start: projectStartDate,
                    end: projectEndDate,
                    address: address,
                    description: description,

                    // Direct Cloudinary image URLs
                    images: imagesUrl,

                    projectImagesId:
                        projectImageId,

                    // Direct Cloudinary PDF URLs
                    pdfs: uploadedPdfResults
                }

                console.log(
                    'Final project object:',
                    finalProject
                )

                // ---------------------------------------------
                // CREATE PROJECT API
                // ---------------------------------------------

                const res =
                    await createProject(
                        finalProject
                    )

                if (res?.status) {
                    notification(
                        'Project created successfully',
                        'success'
                    )

                    onClose()
                } else {
                    setError(
                        res?.error ||
                        'Something went wrong'
                    )
                }
            }

            // =================================================
            // EDIT PROJECT
            // =================================================

            if (mode === 'Edit') {
                // ---------------------------------------------
                // EXISTING IMAGES
                // ---------------------------------------------

                const imagesUrl = [
                    ...existingImages
                ]

                // ---------------------------------------------
                // UPLOAD NEW IMAGES
                // ---------------------------------------------

                await Promise.all(
                    files.map(async (file) => {
                        const parsedFileName =
                            ensureUrlSafety(
                                file.name
                            )

                        const parsedExtension =
                            getExtension(
                                file.name
                            )

                        const parsedProjectName =
                            ensureUrlSafety(
                                projectName
                            )

                        const key =
                            `projects/${projectImageId}/images/${parsedFileName}_${parsedProjectName}.${parsedExtension}`

                        const tempUrl =
                            await getPresignedUrl({
                                key
                            })

                        if (
                            !tempUrl ||
                            !tempUrl.url
                        ) {
                            throw new Error(
                                `Failed to get upload URL for ${file.name}`
                            )
                        }

                        const uploadResult =
                            await uploadFile(
                                file.file,
                                tempUrl.url
                            )

                        if (
                            !uploadResult ||
                            !uploadResult.url
                        ) {
                            throw new Error(
                                `Failed to upload image ${file.name}`
                            )
                        }

                        // IMPORTANT:
                        // Direct Cloudinary URL
                        const fileUrl =
                            removeQueryParameters(
                                uploadResult.url
                            )

                        console.log(
                            'New Cloudinary image URL:',
                            fileUrl
                        )

                        imagesUrl.push(
                            fileUrl
                        )
                    })
                )

                // ---------------------------------------------
                // EXISTING PDFS
                // ---------------------------------------------

                const finalPdfs = [
                    ...existingPdfs
                ]

                // ---------------------------------------------
                // CHECK PDF COUNT
                // ---------------------------------------------

                if (
                    finalPdfs.length +
                    pdfFiles.length >
                    3
                ) {
                    throw new Error(
                        'A project can have maximum 3 PDFs.'
                    )
                }

                // ---------------------------------------------
                // UPLOAD NEW PDFS
                // ---------------------------------------------

                const uploadedNewPdfs =
                    await Promise.all(
                        pdfFiles.map(
                            (
                                pdf,
                                index
                            ) =>
                                uploadPdf(
                                    pdf,
                                    finalPdfs.length + index
                                )
                        )
                    )

                finalPdfs.push(
                    ...uploadedNewPdfs
                )

                // ---------------------------------------------
                // FINAL PDF COUNT
                // ---------------------------------------------

                if (finalPdfs.length > 3) {
                    throw new Error(
                        'A project can have maximum 3 PDFs.'
                    )
                }

                // ---------------------------------------------
                // FINAL PROJECT OBJECT
                // ---------------------------------------------

                const finalProject = {
                    name: projectName,
                    title: projectName,
                    start: projectStartDate,
                    end: projectEndDate,
                    address: address,
                    description: description,

                    // Existing + new direct Cloudinary URLs
                    images: imagesUrl,

                    projectImagesId:
                        projectImageId,

                    // Existing + new direct Cloudinary URLs
                    pdfs: finalPdfs,

                    // Images to delete
                    imageTobeDeleted:
                        imagesToDelete,

                    // PDFs to delete
                    pdfsToDelete:
                        pdfsToDelete
                }

                console.log(
                    'Final project object, modify:',
                    finalProject
                )

                // ---------------------------------------------
                // UPDATE PROJECT API
                // ---------------------------------------------

                const res =
                    await updateProject(
                        projectId,
                        finalProject
                    )

                if (res?.status) {
                    notification(
                        'Project updated successfully',
                        'success'
                    )

                    onClose()
                } else {
                    setError(
                        res?.error ||
                        'Something went wrong'
                    )
                }
            }
        } catch (error) {
            console.error(
                'Project submit error:',
                error
            )

            setError(
                error?.message ||
                'Something went wrong while uploading files.'
            )

            notification(
                error?.message ||
                'Something went wrong',
                'error'
            )
        } finally {
            if (setToggleReload) {
                setToggleReload(
                    !toggleReload
                )
            }

            setLoading(false)
        }
    }

    // =====================================================
    // IMAGE HANDLER
    // =====================================================

    const handleFile = (e) => {
        const newFiles =
            e.target.files

        const tempFileArray = []

        for (
            let i = 0;
            i < newFiles.length;
            i++
        ) {
            const file =
                newFiles[i]

            const fileType =
                file.type

            const validImageTypes = [
                'image/gif',
                'image/jpeg',
                'image/png'
            ]

            if (
                validImageTypes.includes(
                    fileType
                )
            ) {
                let tempFile = {
                    id:
                        i +
                        'ABC' +
                        Math.floor(
                            Math.random() * 1000
                        ),

                    file: file,

                    isPrimary: false,

                    urlOfFile:
                        URL.createObjectURL(
                            file
                        ),

                    name: file.name,

                    type: fileType
                }

                if (
                    files.length === 0 &&
                    i === 0
                ) {
                    tempFile = {
                        ...tempFile,
                        isPrimary: true
                    }
                }

                tempFileArray.push(
                    tempFile
                )
            } else {
                notification(
                    'Only JPG, PNG and GIF images are allowed.',
                    'error'
                )
            }
        }

        setFile([
            ...files,
            ...tempFileArray
        ])

        e.target.value = ''
    }

    // =====================================================
    // PDF HANDLER
    // =====================================================

    const handlePdfFile = (e) => {
        const selectedFiles =
            Array.from(
                e.target.files || []
            )

        if (
            selectedFiles.length === 0
        ) {
            return
        }

        const currentPdfCount =
            existingPdfs.length +
            pdfFiles.length

        const availableSlots =
            3 -
            currentPdfCount

        if (
            availableSlots <= 0
        ) {
            notification(
                'This project already has 3 PDFs.',
                'error'
            )

            e.target.value = ''

            return
        }

        const filesToCheck =
            selectedFiles.slice(
                0,
                availableSlots
            )

        if (
            selectedFiles.length >
            availableSlots
        ) {
            notification(
                `Only ${availableSlots} PDF slot(s) available. Maximum 3 PDFs allowed.`,
                'error'
            )
        }

        const validPdfs = []

        for (
            const selectedFile
            of filesToCheck
        ) {
            const isPdf =
                selectedFile.type ===
                    'application/pdf' ||
                selectedFile.name
                    .toLowerCase()
                    .endsWith('.pdf')

            if (!isPdf) {
                notification(
                    `${selectedFile.name} is not a PDF.`,
                    'error'
                )

                continue
            }

            const maxSize =
                10 *
                1024 *
                1024

            if (
                selectedFile.size >
                maxSize
            ) {
                notification(
                    `${selectedFile.name} is larger than 10 MB.`,
                    'error'
                )

                continue
            }

            validPdfs.push(
                selectedFile
            )
        }

        setPdfFiles(
            previousFiles => [
                ...previousFiles,
                ...validPdfs
            ]
        )

        e.target.value = ''
    }

    // =====================================================
    // REMOVE NEW PDF
    // =====================================================

    const removeNewPdf = (index) => {
        setPdfFiles(
            previousFiles =>
                previousFiles.filter(
                    (_, i) =>
                        i !== index
                )
        )
    }

    // =====================================================
    // REMOVE EXISTING PDF
    // =====================================================

    const removeExistingPdf = (pdf) => {
        setPdfsToDelete(
            previousPdfs => {
                if (
                    previousPdfs.includes(
                        pdf
                    )
                ) {
                    return previousPdfs
                }

                return [
                    ...previousPdfs,
                    pdf
                ]
            }
        )

        setExistingPdfs(
            previousPdfs =>
                previousPdfs.filter(
                    item =>
                        item !== pdf
                )
        )

        notification(
            'PDF removed. Click Submit to save changes.',
            'success'
        )
    }

    // =====================================================
    // REMOVE IMAGE
    // =====================================================

    const imagePillRemove = (
        file,
        existing = false
    ) => {
        if (existing) {
            setImagesToDelete(
                previousImages => [
                    ...previousImages,
                    file
                ]
            )

            setExistingImages(
                previousImages =>
                    previousImages.filter(
                        d1 =>
                            d1 !== file
                    )
            )
        }

        setFile(
            files
                .filter(
                    d1 =>
                        d1?.id !==
                        file?.id
                )
                .map(
                    (
                        p1,
                        index
                    ) => {
                        if (
                            file.isPrimary &&
                            index === 0
                        ) {
                            return {
                                ...p1,
                                isPrimary: true
                            }
                        }

                        return p1
                    }
                )
        )
    }

    // =====================================================
    // TOTAL PDF COUNT
    // =====================================================

    const totalPdfCount =
        existingPdfs.length +
        pdfFiles.length

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <Modal>
            <Card
                header={pageTitle}
                close={onClose}
            >
                {message ? (
                    <div className="p-5 text-center w-[300px]">
                        {message}
                    </div>
                ) : (
                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >
                        {/* ========================================= */}
                        {/* PROJECT NAME */}
                        {/* ========================================= */}

                        <div className="flex space-x-2 mt-3">
                            <Input
                                id="Project Name"
                                value={
                                    projectName
                                }
                                onChange={
                                    setProjectName
                                }
                                disabled={
                                    disabled
                                }
                                required={
                                    true
                                }
                            />
                        </div>

                        {/* ========================================= */}
                        {/* DATES */}
                        {/* ========================================= */}

                        <div className="flex gap-2 w-1/2 mt-3">
                            <div className="w-full">
                                <DateTimePicker
                                    onChange={(
                                        val
                                    ) => {
                                        const parsedDate =
                                            moment(
                                                val,
                                                'YYYY-MM-DD'
                                            )

                                        if (
                                            parsedDate.isValid()
                                        ) {
                                            setProjectStartDate(
                                                parsedDate.format(
                                                    'YYYY-MM-DD'
                                                )
                                            )
                                        }
                                    }}
                                    value={
                                        projectStartDate
                                            ? moment(
                                                projectStartDate,
                                                'YYYY-MM-DD'
                                            ).format(
                                                'YYYY-MM-DD'
                                            )
                                            : ''
                                    }
                                    label="Start Date"
                                    required={
                                        true
                                    }
                                />
                            </div>

                            <div className="w-full">
                                <DateTimePicker
                                    onChange={(
                                        val
                                    ) => {
                                        const parsedDate =
                                            moment(
                                                val,
                                                'YYYY-MM-DD'
                                            )

                                        if (
                                            parsedDate.isValid()
                                        ) {
                                            setProjectEndDate(
                                                parsedDate.format(
                                                    'YYYY-MM-DD'
                                                )
                                            )
                                        }
                                    }}
                                    value={
                                        projectEndDate
                                            ? moment(
                                                projectEndDate,
                                                'YYYY-MM-DD'
                                            ).format(
                                                'YYYY-MM-DD'
                                            )
                                            : ''
                                    }
                                    label="End Date"
                                    required={
                                        true
                                    }
                                />
                            </div>
                        </div>

                        {/* ========================================= */}
                        {/* DATE ERROR */}
                        {/* ========================================= */}

                        {dateError && (
                            <div className="text-[12px] text-red-500 mt-1">
                                *Error: {dateError}
                            </div>
                        )}

                        {/* ========================================= */}
                        {/* ADDRESS */}
                        {/* ========================================= */}

                        <div className="flex space-x-2 mt-3">
                            <TextArea
                                id="Address"
                                value={
                                    address
                                }
                                onChange={
                                    setAddress
                                }
                                disabled={
                                    disabled
                                }
                                required={
                                    true
                                }
                            />
                        </div>

                        {/* ========================================= */}
                        {/* DESCRIPTION */}
                        {/* ========================================= */}

                        <div className="flex space-x-2 mt-3">
                            <TextArea
                                id="Description"
                                value={
                                    description
                                }
                                onChange={
                                    setDescription
                                }
                                disabled={
                                    disabled
                                }
                                required={
                                    true
                                }
                            />
                        </div>

                        {/* ========================================= */}
                        {/* IMAGES */}
                        {/* ========================================= */}

                        <div className="flex space-x-2 mt-3 w-full">
                            <ImageInputPills
                                handleFile={
                                    handleFile
                                }
                                files={
                                    files
                                }
                                imagePillRemove={
                                    imagePillRemove
                                }
                                existingImages={
                                    existingImages
                                }
                            />
                        </div>

                        {/* ========================================= */}
                        {/* PDF UPLOAD */}
                        {/* ========================================= */}

                        <div className="mt-5 w-full">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project PDFs
                                </label>

                                <span className="text-xs font-semibold text-gray-500">
                                    {totalPdfCount}/3
                                </span>
                            </div>

                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">

                                {/* FILE INPUT */}

                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    multiple
                                    onChange={
                                        handlePdfFile
                                    }
                                    disabled={
                                        disabled ||
                                        loading ||
                                        totalPdfCount >= 3
                                    }
                                    className="
                                        block w-full text-sm text-gray-700
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        disabled:opacity-50
                                    "
                                />

                                <p className="text-xs text-gray-500 mt-2">
                                    Upload maximum 3 PDF files.
                                    Each PDF must be less than 10 MB.
                                </p>

                                {/* AVAILABLE SLOTS */}

                                {totalPdfCount < 3 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {3 - totalPdfCount} PDF slot
                                        {3 - totalPdfCount !== 1
                                            ? 's'
                                            : ''
                                        } remaining.
                                    </p>
                                )}

                                {totalPdfCount >= 3 && (
                                    <p className="text-xs text-orange-600 mt-1 font-medium">
                                        Maximum 3 PDFs reached.
                                    </p>
                                )}

                                {/* ========================================= */}
                                {/* EXISTING PDFS */}
                                {/* ========================================= */}

                                {existingPdfs.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Existing PDFs
                                        </p>

                                        {existingPdfs.map(
                                            (
                                                pdf,
                                                index
                                            ) => (
                                                <div
                                                    key={`existing-${index}-${pdf}`}
                                                    className="mt-2 flex items-center justify-between bg-white border rounded-md p-3"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-red-500 text-lg shrink-0">
                                                            📄
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                Project PDF {index + 1}
                                                            </p>

                                                            <a
                                                                href={pdf}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                View PDF
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {mode === 'Edit' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeExistingPdf(
                                                                    pdf
                                                                )
                                                            }
                                                            className="ml-3 shrink-0 text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* ========================================= */}
                                {/* NEW PDFS */}
                                {/* ========================================= */}

                                {pdfFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            New PDFs
                                        </p>

                                        {pdfFiles.map(
                                            (
                                                pdf,
                                                index
                                            ) => (
                                                <div
                                                    key={`new-${index}-${pdf.name}`}
                                                    className="mt-2 flex items-center justify-between bg-white border rounded-md p-3"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-red-500 text-lg shrink-0">
                                                            📄
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[220px]">
                                                                {pdf.name}
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    (
                                                                        pdf.size /
                                                                        (
                                                                            1024 *
                                                                            1024
                                                                        )
                                                                    ).toFixed(
                                                                        2
                                                                    )
                                                                } MB
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeNewPdf(
                                                                index
                                                            )
                                                        }
                                                        className="ml-3 shrink-0 text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========================================= */}
                        {/* ERROR */}
                        {/* ========================================= */}

                        {error && (
                            <div className="text-red-500 text-sm mt-3">
                                {error}
                            </div>
                        )}

                        {/* ========================================= */}
                        {/* SUBMIT */}
                        {/* ========================================= */}

                        <div className="flex justify-center mt-5">
                            {mode === 'view'
                                ? ''
                                : (
                                    <button
                                        type="submit"
                                        className="bg-blue-500 disabled:bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        disabled={
                                            loading ||
                                            disabled
                                        }
                                    >
                                        {loading
                                            ? 'Saving...'
                                            : 'Submit'
                                        }
                                    </button>
                                )}
                        </div>
                    </form>
                )}
            </Card>
        </Modal>
    )
}

export default CreateProject

