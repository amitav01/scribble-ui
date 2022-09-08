import { Component } from "react";
import { errorMessages } from "../../utils/constants";
import Modal from "../modal/modal";

class ErrorBoundary extends Component {
  componentDidCatch(error) {
    this.props.setAppError(errorMessages.error_boundary);
    console.error(error);
  }

  render() {
    if (this.props.appError) {
      return (
        <Modal {...this.props.appError} click={this.props.click} />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
