import { useEffect, useState } from "react";
import BookModel from "../../models/BookModel";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarsReview } from "../Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import ReviewModel from "../../models/ReviewModel";
import { LatestReviews } from "./LatestReviews";
import { useOktaAuth } from "@okta/okta-react";
import { error } from "console";
import ReviewRequestModel from "../../models/ReviewRequestModel";

export const BookCheckoutPage = () => {

    const { authState } = useOktaAuth();

    //Book State

    const [book, setBook] = useState<BookModel>();
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const [httpError, setHttpError] = useState(null);

    // Review State

    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [isLoadingReview, setIsLoadingReview] = useState(true);

    const [isReviewLeft, setIsReviewLeft] = useState(false);
    const [isLoadingIsReviewLeft, setIsLoadingIsReviewLeft] = useState(true);



    // Loans Count State
    const [currentLoansCount, setCurrentLoansCount] = useState(0);
    const [isLoadingCurrenLoansCount, setIsLoadingCurrentLoansCount] = useState(true);

    // Is Book Checked out ?

    const [isCheckedout, setIsCheckedout] = useState(false);
    const [isLoadingIsCheckedout, setIsLoadingIsCheckedout] = useState(true);

    // By doing this we obtain the book id from the url
    const bookId = (window.location.pathname).split('/')[2];

    useEffect(() => {

        const fetchBook = async () => {

            const url: string = `http://localhost:8080/api/books/${bookId}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const responseJson = await response.json();


            const loadedBook = {
                id: responseJson.id,
                title: responseJson.title,
                author: responseJson.author,
                description: responseJson.description,
                copies: responseJson.copies,
                copiesAvailable: responseJson.copiesAvailable,
                category: responseJson.category,
                img: responseJson.img
            };

            setBook(loadedBook);
            setIsLoadingBook(false);
        };

        fetchBook().catch((error: any) => {
            //In case it fails
            setIsLoadingBook(false);
            setHttpError(error.message);
        })


    }, [isCheckedout])

    useEffect(() => {

        const fetchReviews = async () => {

            const reviewUrl: string = `http://localhost:8080/api/reviews/search/findReviewByBookId?bookId=${bookId}`;

            const responseReviews = await fetch(reviewUrl);

            if (!responseReviews.ok) {
                throw new Error('Something went wrong');
            }

            const responseReviewsJson = await responseReviews.json();
            const responseReviewsData = responseReviewsJson._embedded.reviews;
            const loadedReviews: ReviewModel[] = [];

            // Taking advantage of the for loop we calculate a weighted average of the rating

            let weightedStarReviews: number = 0
            for (const key in responseReviewsData) {
                loadedReviews.push({
                    id: responseReviewsData[key].id,
                    userEmail: responseReviewsData[key].userEmail,
                    date: responseReviewsData[key].date,
                    rating: responseReviewsData[key].rating,
                    book_id: responseReviewsData[key].bookId,
                    reviewDescription: responseReviewsData[key].reviewDescription,
                })

                weightedStarReviews += responseReviewsData[key].rating;
            }

            weightedStarReviews = Number((weightedStarReviews / responseReviewsData.length).toFixed(1));

            setTotalStars(weightedStarReviews);

            setReviews(loadedReviews);
            setIsLoadingReview(false);
        };

        fetchReviews().catch((error: any) => {
            //In case it fails
            setIsLoadingReview(false);
            setHttpError(error.message);
        })
    }, [isReviewLeft])

    useEffect(() => {

        const fetchIsReviewLeft = async () => {
            if ( authState && authState?.isAuthenticated) {
                const url = `http://localhost:8080/api/reviews/secure/user/book?bookId=${bookId}`;
                const requestOptions = {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        "Content-Type": "application/json"
                    }
                }

                const isReviewLeftResponse = await fetch(url, requestOptions);

                if (!isReviewLeftResponse.ok) {
                    throw new Error('Error when checking if review already listed');
                }

                const isReviewLeftResponseJson = await isReviewLeftResponse.json();
                setIsReviewLeft(isReviewLeftResponseJson);
            }

            setIsLoadingIsReviewLeft(false);
        }

        fetchIsReviewLeft().catch((error: any) => {
            setHttpError(error.message);
            setIsLoadingIsReviewLeft(false);
        })
    }, [authState])

    useEffect(() => {

        const fetchCurrentLoans = async () => {

            if (authState && authState.isAuthenticated) {
                const url: string = `http://localhost:8080/api/books/secure/currentloans/count`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }

                const loansResponse = await fetch(url, requestOptions);

                if (!loansResponse.ok) {
                    throw new Error('Error getting the current loans count');
                }
                const loansResponseJson = await loansResponse.json();
                setCurrentLoansCount(loansResponseJson);
            }

            setIsLoadingCurrentLoansCount(false);

        }

        fetchCurrentLoans().catch((error: any) => {
            setIsLoadingCurrentLoansCount(false);
            setHttpError(error.message);
        })
    }, [authState, isCheckedout])

    useEffect(() => {

        const fetchIsCheckedout = async () => {

            if (authState && authState.isAuthenticated) {
                const url: string = `http://localhost:8080/api/books/secure/ischeckedout/byuser?bookId=${bookId}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }

                const isCheckedoutResponse = await fetch(url, requestOptions);

                if (!isCheckedoutResponse.ok) {
                    throw new Error('Error getting the current loans count');
                }
                const isCheckedoutResponseJson = await isCheckedoutResponse.json();
                setIsCheckedout(isCheckedoutResponseJson);
            }

            setIsLoadingIsCheckedout(false);
        }

        fetchIsCheckedout().catch((error: any) => {
            setIsLoadingIsCheckedout(false);
            setHttpError(error.message);
        })
    }, [authState])

    if (isLoadingBook || isLoadingReview || isLoadingCurrenLoansCount || isLoadingIsCheckedout || isLoadingIsReviewLeft) {
        return (
            <SpinnerLoading />
        )
    }

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        )
    }

    async function checkoutBook() {

        const url = `http://localhost:8080/api/books/secure/checkout?bookId=${bookId}`;
        const requestOptions = {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${authState?.accessToken?.accessToken}`,
                'Content-Type': 'application/json'
            }
        }
        const checkoutBookResponse = await fetch(url, requestOptions);

        if (!checkoutBookResponse.ok) {
            throw new Error('Error when checking out book');
        }
        setIsCheckedout(true);

    }

    async function submitReview(starInput:number, reviewDescription:string){

        let bookId:number=0;

        if(book?.id){
            bookId=book.id;
        }

        const reviewRequestModel=new ReviewRequestModel(starInput, bookId, reviewDescription);

        const url = `http://localhost:8080/api/reviews/secure`;
        const requestOptions = {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authState?.accessToken?.accessToken}`,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(reviewRequestModel),
        }
        const submitReviewResponse = await fetch(url, requestOptions);

        if (!submitReviewResponse.ok) {
            throw new Error('Error when submiting review');
        }
        setIsReviewLeft(true);
    }

    return (
        <div>
            {/* Desktop */}
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2 col-md-2 d-flex align-items-center">

                        {
                            book?.img ?

                                <img src={book?.img} width="226" height="349" alt="Book" />
                                :
                                <img src={require("../../Images/BooksImages/book-luv2code-1000.png")}
                                    width="226" height="349" alt="Book" />
                        }

                    </div>
                    <div className="col-4 col-md-4 container">
                        <div className="ml-2">
                            <h2> {book?.title}</h2>
                            <h5 className="text-primary">{book?.author}</h5>
                            <p className="lead">{book?.description}</p>
                            <StarsReview rating={totalStars} size={32} />
                        </div>
                    </div>
                    <CheckoutAndReviewBox book={book} mobile={false} currentLoans={currentLoansCount}
                        isAuthenticated={authState?.isAuthenticated} isCheckedout={isCheckedout}
                        checkoutBook={checkoutBook} isReviewLeft={isReviewLeft} submitReview={submitReview}/>
                </div>
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={false}></LatestReviews>
            </div>

            {/* Mobile */}
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center align-items-center">

                    {
                        book?.img ?

                            <img src={book?.img} width="226" height="349" alt="Book" />
                            :
                            <img src={require("../../Images/BooksImages/book-luv2code-1000.png")}
                                width="226" height="349" alt="Book" />
                    }
                </div>
                <div className="mt-4">
                    <div className="ml-2">
                        <h2> {book?.title}</h2>
                        <h5 className="text-primary">{book?.author}</h5>
                        <p className="lead">{book?.description}</p>
                        <StarsReview rating={totalStars} size={32} />
                    </div>
                </div>
                <CheckoutAndReviewBox book={book} mobile={true} currentLoans={currentLoansCount}
                    isAuthenticated={authState?.isAuthenticated} isCheckedout={isCheckedout}
                    checkoutBook={checkoutBook} isReviewLeft={isReviewLeft} submitReview={submitReview} />
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={true}></LatestReviews>
            </div>

        </div>
    );
}