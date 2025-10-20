import React from 'react'
import "./ShareLocationModal.css";


const ShareLocationModal = () => {
    const [email, setEmail] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [sendStatus, setSendStatus] = React.useState("");
    const [locationUrl, setLocationUrl] = React.useState("");

    // Get user's current location and generate Google Maps link
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Google Maps direct link to coordinates
                    setLocationUrl(`https://maps.google.com/?q=${latitude},${longitude}`);
                },
                (error) => {
                    setLocationUrl("");
                }
            );
        } else {
            setLocationUrl("");
        }
    }, []);

    // Email send handler (simulate async send)
    const handleSendLink = () => {
        if (!email) {
            setSendStatus("Please enter a valid email.");
            return;
        }
        setSendStatus("Sending...");
        setTimeout(() => {
            setSendStatus("Link sent to " + email + "!");
        }, 1000);
    };

    // Copy link handler
    const handleCopyLink = () => {
        if (!locationUrl) return;
        navigator.clipboard.writeText(locationUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    // Social share handlers
    const handleShare = (platform) => {
        if (!locationUrl) return;
        let shareUrl = "";
        const encodedUrl = encodeURIComponent(locationUrl);
        switch (platform) {
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodedUrl}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case "telegram":
                shareUrl = `https://t.me/share/url?url=${encodedUrl}`;
                break;
            case "snapchat":
                shareUrl = `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`;
                break;
            default:
                break;
        }
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <div className="modal fade" id="shareLocationModal" tabIndex="-1" aria-labelledby="shareLocationLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-2">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold" id="shareLocationLabel">Share Location</h5>
                        <button type="button" className="btn-closeHo" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* Email Input & Send Link */}
                        <div className="input-group mb-3">
                            <input
                                type="email"
                                className="form-control border-purple text-purple"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setSendStatus(""); }}
                                placeholder='hellolocation@gmail.com'
                            />
                            <button className="btn btn-purple text-white" onClick={handleSendLink}>Send Link</button>
                        </div>
                        {sendStatus && <div className="text-danger small mb-2">{sendStatus}</div>}

                        {/* Social Buttons */}
                        <div className="d-flex justify-content-between text-center mb-4">
                            <div className="flex-fill mx-1">
                                <button className="btn w-100 text-white py-2" style={{ backgroundColor: '#25D366' }} onClick={() => handleShare("whatsapp") }>
                                    <i className="bi bi-whatsapp fs-3"></i>
                                </button>
                                <p>WhatsApp</p>
                            </div>
                            <div className="flex-fill mx-1">
                                <button className="btn w-100 text-white py-2" style={{ backgroundColor: '#1877F2' }} onClick={() => handleShare("facebook") }>
                                    <i className="bi bi-facebook fs-3"></i>
                                </button>
                                <p>Facebook</p>
                            </div>
                            <div className="flex-fill mx-1">
                                <button className="btn w-100 text-white py-2" style={{ backgroundColor: '#0088cc' }} onClick={() => handleShare("telegram") }>
                                    <i className="bi bi-telegram fs-3"></i>
                                </button>
                                <p>Telegram</p>
                            </div>
                            <div className="flex-fill mx-1">
                                <button className="btn w-100 text-dark py-2" style={{ backgroundColor: '#fffc00' }} onClick={() => handleShare("snapchat") }>
                                    <i className="bi bi-snapchat fs-3"></i>
                                </button>
                                <p>Snapchat</p>
                            </div>
                        </div>

                        {/* Link Box */}
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                            <input type="text" className="form-control" value={locationUrl ? locationUrl : "Fetching location..."} readOnly />
                            <button className="btn btn-purple text-white" onClick={handleCopyLink} disabled={!locationUrl}>{copied ? "Copied!" : "Copy Link"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShareLocationModal