import { Link } from "react-router-dom";
import BookModel from "../../models/BookModel";
import { LeaveAReview } from "../Utils/LeaveAReview";

export const CheckoutAndReviewBox: React.FC<{
    book: BookModel | undefined, mobile: boolean, currentLoans: number,
    isAuthenticated: any, isCheckedout: boolean, checkoutBook: any, isReviewLeft: boolean,
    submitReview:any
}> = (props) => {

    function buttonRender() {

        if (props.isAuthenticated) {
            if (!props.isCheckedout && props.currentLoans < 5) {

                return (<button className="btn btn-success btn-lg" onClick={() => props.checkoutBook()}>Checkout</button>)
            } else if (props.isCheckedout) {
                return (<p><b>Book Checked out. Enjoy!</b></p>)
            } else if (!props.isCheckedout) {
                return (<p className="text-danger">Too many Books Checked out.</p>)
            }
        }

        return <Link to='/login' className="btn btn-success btn-lg">Sign In</Link>
    }

    function reviewRender() {

        if (props.isAuthenticated && !props.isReviewLeft) {

            return (<LeaveAReview submitReview={props.submitReview}/>);
        } else if (props.isAuthenticated && props.isReviewLeft) {
            return (<p><b>Thank you for your Review</b></p>)
        }

        return (<div><hr /><p>Sign In to leave a Review</p></div>)
    }

    return (

        <div className={props.mobile ? 'card d-flex mt-5' : 'card col-3 container d-flex mb-5'}>
            <div className="card-body container">
                <div className="mt-3">
                    <p>
                        <b>{props.currentLoans}/5 </b>Books Checked Out
                    </p>
                    <hr />
                    {
                        props.book && props.book.copiesAvailable && props.book.copiesAvailable > 0 ?
                            <h4 className="text-success">
                                Available
                            </h4>
                            :
                            <h4 className="text-danger">
                                Wait List
                            </h4>
                    }
                    <div className="row">
                        <p className="col-6 lead">
                            <b>{props.book?.copies} </b>Copies
                        </p>
                        <p className="col-6 lead">
                            <b>{props.book?.copiesAvailable} </b>Available
                        </p>
                    </div>

                    {buttonRender()}

                    <hr />

                    <p className="mt-3">
                        This number can change until placing order has been complete
                    </p>

                    {reviewRender()}
                </div>
            </div>
        </div>
    )
}