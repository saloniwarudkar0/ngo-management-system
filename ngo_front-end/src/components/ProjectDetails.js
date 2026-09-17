import React, { useEffect, useState } from 'react'
import CloseIcon from '../Icons/CloseIcon'
import Project from './Project'
import { getProjectById } from '../Actions/projectActions'

function ProjectDetails(props) {
  const {
    onClose,
    projectId,
    setEditMode,
    setDeleteMode
  } = props

  const [projectPdfs, setProjectPdfs] = useState([])
  const [loadingPdfs, setLoadingPdfs] = useState(true)

  useEffect(() => {
    getProjectPdfs()
  }, [projectId])

  const getProjectPdfs = async () => {
    try {
      setLoadingPdfs(true)

      const res = await getProjectById(projectId)

      console.log('PROJECT DETAILS RESPONSE:', res)

      if (res?.status) {
        const project = res?.project || {}

        console.log('PROJECT PDFS:', project?.pdfs)
        console.log('PROJECT OLD PDF:', project?.pdf)

        let pdfList = []

        if (Array.isArray(project?.pdfs)) {
          pdfList = project.pdfs.filter(Boolean)
        } else if (project?.pdf) {
          pdfList = [project.pdf]
        } else if (project?.projectPdf) {
          pdfList = [project.projectPdf]
        } else if (project?.pdfUrl) {
          pdfList = [project.pdfUrl]
        }

        pdfList = pdfList.slice(0, 3)

        setProjectPdfs(pdfList)
      } else {
        setProjectPdfs([])
      }
    } catch (error) {
      console.error('Error while getting project PDFs:', error)
      setProjectPdfs([])
    } finally {
      setLoadingPdfs(false)
    }
  }

  const getPdfName = (pdf, index) => {
    try {
      const url = new URL(pdf)
      const pathname = url.pathname
      const fileName = pathname.split('/').pop()

      if (fileName) {
        const decodedName = decodeURIComponent(fileName)

        const cleanName = decodedName
          .replace(/\.pdf$/i, '')
          .replace(/^[^_]+_\d+_/, '')
          .replace(/_/g, ' ')
          .trim()

        if (cleanName) {
          return `${cleanName}.pdf`
        }
      }
    } catch (error) {
      console.log('Unable to read PDF filename:', error)
    }

    return `Project Document ${index + 1}.pdf`
  }

  return (
    <>
      <style>{`

        /* ================================
           MAIN MODAL
        ================================= */

        .project-details-wrapper {
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;

          background: #ffffff;

          border-radius: 22px;

          box-shadow:
            0 25px 60px rgba(15, 23, 42, 0.18),
            0 8px 25px rgba(15, 23, 42, 0.08);

          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .project-details-wrapper::-webkit-scrollbar {
          width: 7px;
        }

        .project-details-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }

        .project-details-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }


        /* ================================
           HEADER
        ================================= */

        .project-details-header {
          position: sticky;
          top: 0;
          z-index: 30;

          min-height: 76px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 16px 22px;

          background: rgba(255, 255, 255, 0.96);

          backdrop-filter: blur(14px);

          border-bottom: 1px solid #e2e8f0;
        }

        .project-details-header-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .project-details-header-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #e9f7f0;

          color: #1b7f5a;

          font-size: 20px;
        }

        .project-details-title {
          margin: 0;

          font-size: 18px;

          line-height: 1.2;

          font-weight: 700;

          color: #0f172a;
        }

        .project-details-subtitle {
          margin: 4px 0 0;

          font-size: 12px;

          color: #64748b;
        }

        .project-details-close {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          cursor: pointer;

          color: #475569;

          background: #f8fafc;

          border: 1px solid #e2e8f0;

          transition: all 0.2s ease;
        }

        .project-details-close:hover {
          background: #f1f5f9;

          color: #0f172a;

          transform: rotate(4deg);
        }


        /* ================================
           PROJECT INFORMATION
        ================================= */

        .project-main-section {
          padding: 4px 18px 0;

          background: #f8fafc;
        }

        .project-main-card {
          overflow: hidden;

          border-radius: 18px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.05);
        }


        /* ================================
           PROJECT DOCUMENTS
        ================================= */

        .project-document-section {
          padding: 4px 22px 22px;

          background: #ffffff;

          border-top: 1px solid #e2e8f0;
        }

        .project-document-heading {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          margin-bottom: 8px;
        }

        .project-document-heading-left {
          display: flex;

          align-items: center;

          gap: 11px;
        }

        .project-document-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 12px;

          background: #fff1f2;

          color: #dc2626;

          font-size: 20px;
        }

        .project-document-title {
          margin: 0;

          font-size: 16px;

          font-weight: 700;

          color: #0f172a;
        }

        .project-document-description {
          margin: 3px 0 0;

          font-size: 12px;

          color: #64748b;
        }

        .project-document-count {
          padding: 5px 10px;

          border-radius: 999px;

          background: #f1f5f9;

          color: #64748b;

          font-size: 11px;

          font-weight: 600;

          white-space: nowrap;
        }


        /* ================================
           PDF LIST
        ================================= */

        .project-document-list {
          display: flex;

          flex-direction: column;

          gap: 6px;
        }

        .project-document-card {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding: 12px 14px;

          border: 1px solid #e2e8f0;

          border-radius: 14px;

          background: #f8fafc;

          transition: all 0.2s ease;
        }

        .project-document-card:hover {
          border-color: #b7dccb;

          background: #f9fdfb;

          transform: translateY(-1px);

          box-shadow:
            0 5px 16px rgba(27, 127, 90, 0.06);
        }

        .project-document-info {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 12px;
        }

        .project-pdf-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 11px;

          background: #ffffff;

          border: 1px solid #fecdd3;

          font-size: 19px;
        }

        .project-pdf-name {
          margin: 0;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 13px;

          font-weight: 650;

          color: #334155;
        }

        .project-pdf-type {
          margin: 4px 0 0;

          font-size: 11px;

          color: #94a3b8;
        }


        /* ================================
           PDF BUTTONS
        ================================= */

        .project-document-actions {
          display: flex;

          flex-shrink: 0;

          align-items: center;

          gap: 8px;
        }

        .project-pdf-view,
        .project-pdf-download {
          min-height: 36px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 0 13px;

          border-radius: 9px;

          font-size: 11px;

          font-weight: 700;

          text-decoration: none;

          transition: all 0.2s ease;
        }

        .project-pdf-view {
          color: #1b7f5a;

          background: #ffffff;

          border: 1px solid #b7dccb;
        }

        .project-pdf-view:hover {
          color: #ffffff;

          background: #1b7f5a;

          border-color: #1b7f5a;
        }

        .project-pdf-download {
          color: #ffffff;

          background: #1b7f5a;

          border: 1px solid #1b7f5a;
        }

        .project-pdf-download:hover {
          background: #166b4c;

          border-color: #166b4c;

          transform: translateY(-1px);
        }


        /* ================================
           LOADING
        ================================= */

        .project-document-loading {
          padding: 8px;

          text-align: center;

          color: #94a3b8;

          font-size: 13px;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 640px) {

          .project-details-wrapper {
            max-height: 95vh;

            border-radius: 17px;
          }

          .project-details-header {
            min-height: 68px;

            padding: 13px 15px;
          }

          .project-details-header-icon {
            width: 37px;
            height: 37px;

            font-size: 17px;
          }

          .project-details-title {
            font-size: 16px;
          }

          .project-details-subtitle {
            font-size: 11px;
          }

          .project-main-section {
            padding: 3px 10px 0;
          }

          .project-document-section {
            padding: 4px 16px 16px;
          }

          .project-document-heading {
            align-items: flex-start;
          }

          .project-document-card {
            align-items: flex-start;

            flex-direction: column;
          }

          .project-document-actions {
            width: 100%;
          }

          .project-pdf-view,
          .project-pdf-download {
            flex: 1;
          }

          .project-pdf-name {
            max-width: 220px;
          }

        }

      `}</style>


      <div className='project-details-wrapper'>

        {/* HEADER */}

        <div className='project-details-header'>

          <div className='project-details-header-left'>

            <div className='project-details-header-icon'>
              💧
            </div>

            <div>

              <h2 className='project-details-title'>
                Project Details
              </h2>

              <p className='project-details-subtitle'>
                Project information and documents
              </p>

            </div>

          </div>


          <button
            type='button'
            className='project-details-close'
            onClick={onClose}
            aria-label='Close project details'
          >
            <CloseIcon size={5} />
          </button>

        </div>


        {/* PROJECT INFORMATION */}

        <div className='project-main-section'>

          <div className='project-main-card'>

            <Project
              setOpenModal={onClose}
              setEditMode={setEditMode}
              projectId={projectId}
              setDeleteMode={setDeleteMode}
            />

          </div>

        </div>


        {/* PROJECT PDFs */}

        {!loadingPdfs && projectPdfs.length > 0 && (

          <div className='project-document-section'>

            <div className='project-document-heading'>

              <div className='project-document-heading-left'>

                <div className='project-document-icon'>
                  📄
                </div>

                <div>

                  <h3 className='project-document-title'>
                    Project Documents
                  </h3>

                  <p className='project-document-description'>
                    Reports and documents related to this project
                  </p>

                </div>

              </div>


              <span className='project-document-count'>

                {projectPdfs.length}{' '}

                {projectPdfs.length === 1
                  ? 'Document'
                  : 'Documents'}

              </span>

            </div>


            <div className='project-document-list'>

              {projectPdfs.map((pdf, index) => (

                <div
                  key={`${pdf}-${index}`}
                  className='project-document-card'
                >

                  {/* PDF INFORMATION */}

                  <div className='project-document-info'>

                    <div className='project-pdf-icon'>
                      📕
                    </div>

                    <div className='min-w-0'>

                      <p className='project-pdf-name'>
                        {getPdfName(pdf, index)}
                      </p>

                      <p className='project-pdf-type'>
                        PDF Project Report
                      </p>

                    </div>

                  </div>


                  {/* PDF ACTIONS */}

                  <div className='project-document-actions'>

                    <a
                      href={pdf}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='project-pdf-view'
                    >
                      View PDF
                    </a>

                    <a
                      href={pdf}
                      download
                      className='project-pdf-download'
                    >
                      Download
                    </a>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* PDF LOADING */}

        {loadingPdfs && (

          <div className='project-document-section'>

            <div className='project-document-loading'>
              Loading project documents...
            </div>

          </div>

        )}

      </div>
    </>
  )
}

export default ProjectDetails