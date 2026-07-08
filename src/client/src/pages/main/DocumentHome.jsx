import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { createNewDoc, deleteTheDoc, getAllLoggedInUserDocs } from '../../helpers/docs/doc.helper';
import { toast } from 'react-toastify';
import { useSupplier } from '../../context/supplierContext';
import { useNavigate } from 'react-router-dom';

const DocumentHome = () => {

    const { auth } = useAuth();
    const [data, setData] = useState([{}]);
    const [title, setTitle] = useState('');
    const { loading, setLoading, shouldUpdate, triggerUpdate } = useSupplier();
    const navigator = useNavigate();

    useEffect(() => {
        if (!auth) {
            toast.error('Please Login to continue');
            navigator('/');
        }
    }, [auth]);

    useEffect(() => {


        const setDocuments = async () => {

            const documents = await getAllLoggedInUserDocs(auth?.token);


            if (documents?.status === 200) {
                setData(documents?.data?.documents);
                return;
            }

            toast.error(documents?.message);



        }

        auth?.token ? setDocuments() : null;

        auth?.token ? document.title = `Welcome ${auth?.user?.username} 👋` : null


    }, [auth?.token, shouldUpdate]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await createNewDoc(title, auth?.token).finally(() => { setLoading(false); });

        if (result?.status === 201) {

            setTitle('');
            toast.success('Document Created Successfully');
            document.getElementById("closeTheModal").click();
            triggerUpdate();
            return;
        }

        toast.error(result?.message);


    }

    const handleDelete = async (id) => {
        setLoading(true);
        const res = await deleteTheDoc(id, auth?.token).finally(() => { setLoading(false); });
        if (res?.status === 200) {
            toast.success(res.message);
            triggerUpdate();
            return;
        }

        toast.error(res?.message);
    }

    return (
        <>
            <div className="container my-4">
                <div className="row d-flex align-items-center justify-content-between px-3">
                    {/* Greeting Section */}
                    <div className="col-12 col-md-8">
                        <h1 className="display-5 text-primary">
                            Hello {auth?.user?.username} 👋
                        </h1>
                        <p className="lead">
                            Welcome to your document home page
                        </p>
                    </div>
                    {/* Create New + Upload */}
                    <div className="col-12 col-md-4 d-flex justify-content-md-end align-items-center gap-2 mt-3 mt-md-0">
                        <label
className={`btn ${(typeof darkMode !== 'undefined' && darkMode) ? 'btn-outline-light' : 'btn-outline-primary'} d-flex align-items-center gap-2`}

                            style={{ cursor: 'pointer' }}
                            title="Upload document"
                        >
                            <i className="bi bi-upload"></i>
                            Upload
                            <input
                                type="file"
                                accept=".json,.txt,.doc,.docx,.pdf,.md,.js,.ts,.py,.java,.c,.cpp,.jsx,.tsx"
                                hidden
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (!auth?.token) return;

                                    setLoading(true);
                                    try {
                                        const fd = new FormData();
                                        fd.append('file', file);
                                        fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
                                        // MVP: backend checks for json by mimetype/extension.
                                        fd.append('contentType', file.name.toLowerCase().endsWith('.json') ? 'json' : 'text');

                                        const { uploadDoc } = await import('../../helpers/docs/upload.helper');
                                        const result = await uploadDoc(fd, auth?.token);

                                        if (result?.status === 201) {
                                            toast.success('Uploaded successfully');
                                            triggerUpdate();
                                        } else {
                                            toast.error(result?.message || 'Upload failed');
                                        }
                                    } finally {
                                        setLoading(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>

                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#createDoc"
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i>Create New
                        </button>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="row my-4 d-flex justify-content-center">
                    {!loading ? (
                        data?.map((cardData, index) => (
                            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 my-3 d-flex justify-content-center">
                                <Card cardData={cardData} deleteEvent={handleDelete} />
                            </div>
                        ))
                    ) : (
                        <Loader />
                    )}
                </div>

                {/* Create New Document Modal */}
                <Modal
                    title="Create New Document"
                    modalId="createDoc"
                    content={
                        <form className="form-control bg-light p-4" onSubmit={handleAdd}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="form-control"
                                    id="title"
                                    placeholder="Document Title"
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    }
                />
            </div>
        </>
    )
}

export default DocumentHome