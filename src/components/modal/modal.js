import "./modal.scss";

const Modal = ({ title, message, click }) => {
  return (
    <div className="modal-container d-flex">
      <div className="modal">
        <div className="header">
          <h2>{title}</h2>
        </div>
        <div className="message">
          <p>{message}</p>
        </div>
        <div className="footer d-flex">
          <button onClick={click}>Ok</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
