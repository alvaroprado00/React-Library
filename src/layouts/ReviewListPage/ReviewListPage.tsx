import { useEffect, useState } from "react"
import ReviewModel from "../../models/ReviewModel"
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { Review } from "../Utils/Review";
import { Pagination } from "../Utils/Pagination";

export const ReviewListPage = () => {

    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState();


    //Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewsPerPage] = useState(5);
    const [totalAmountOfReviews, setTotalAmountOfReviews] = useState(0);
    const [totalAmountOfPages, setTotalAmountOfPages] = useState(0);


    const bookId = (window.location.pathname).split('/')[2];

    useEffect(() => {

        const fetchReviews = async () => {

            const reviewUrl: string = `${process.env.REACT_APP_API}/reviews/search/findReviewByBookId?bookId=${bookId}&page=${currentPage - 1}&size=${reviewsPerPage}`;

            const responseReviews = await fetch(reviewUrl);

            if (!responseReviews.ok) {
                throw new Error('Something went wrong');
            }

            const responseReviewsJson = await responseReviews.json();

            setTotalAmountOfReviews(responseReviewsJson.page.totalElements);
            setTotalAmountOfPages(responseReviewsJson.page.totalPages);

            const responseReviewsData = responseReviewsJson._embedded.reviews;
            const loadedReviews: ReviewModel[] = [];


            for (const key in responseReviewsData) {
                loadedReviews.push({
                    id: responseReviewsData[key].id,
                    userEmail: responseReviewsData[key].userEmail,
                    date: responseReviewsData[key].date,
                    rating: responseReviewsData[key].rating,
                    book_id: responseReviewsData[key].bookId,
                    reviewDescription: responseReviewsData[key].reviewDescription,
                })
            }
            setReviews(loadedReviews);
            setIsLoading(false);
        };

        fetchReviews().catch((error: any) => {
            //In case it fails
            setIsLoading(false);
            setHttpError(error.message);
        })
    }, [currentPage])


    if (isLoading) {
        return <SpinnerLoading />
    }

    if (httpError) {

        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        )
    }

    //These variables only have purpose to build the <p> tag

    const indexOfLastReview: number = currentPage * reviewsPerPage;
    const indexOfFirstReview: number = indexOfLastReview - reviewsPerPage;

    let lastItem = reviewsPerPage * currentPage <= totalAmountOfReviews ? reviewsPerPage * currentPage : totalAmountOfReviews;

    const Paginate = (page: number) => {

        setCurrentPage(page);
    }

    return (
        <div className="container m-5">
            <div>
                <h3>Comments: ({reviews.length})</h3>
            </div>
            <p>
                {indexOfFirstReview + 1} to {lastItem} of {totalAmountOfReviews} items:
            </p>
            <div className="row">

                {
                    reviews.map(review => (
                        <Review review={review} key={review.id} />
                    ))
                }
            </div>

            {
                // In case there is more than one page insert pagination
                totalAmountOfPages > 1 &&
                <Pagination currentPage={currentPage} totalPages={totalAmountOfPages} paginate={Paginate} />
            }

        </div>
    );
}