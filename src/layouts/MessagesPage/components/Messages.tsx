import { useOktaAuth } from "@okta/okta-react"
import { useState, useEffect } from "react";
import MessageModel from "../../../models/MessageModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { Pagination } from "../../Utils/Pagination";


export const Messages = () => {

    const { authState } = useOktaAuth();

    //Messages
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [httpError, setHttpError] = useState(null);

    //Pagination
    const [messagesPerPage, setMessagesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {

        const fetchMessages = async () => {

            if (authState && authState.isAuthenticated) {
                const userEmail = authState.accessToken?.claims.sub;
                const url = `${process.env.REACT_APP_API}/messages/search/findByUserEmail?userEmail=${userEmail}&page=${currentPage - 1}&size=${messagesPerPage}`;

                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                const fetchMessagesResponse = await fetch(url, requestOptions);

                if (!fetchMessagesResponse.ok) {
                    throw new Error('Error when getting messages from user');
                }

                const fetchMessagesResponseJson = await fetchMessagesResponse.json();

                setTotalPages(fetchMessagesResponseJson.page.totalPages);
                setMessages(fetchMessagesResponseJson._embedded.messages);
            }
            setIsLoadingMessages(false);

        }

        fetchMessages().catch((error: any) => {

            setIsLoadingMessages(false);
            setHttpError(error.message);
        })

        window.scroll(0, 0);

    }, [authState, currentPage])

    if (isLoadingMessages) {
        return (
            <SpinnerLoading />
        );
    }

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        )
    }

    const paginate = (pageNumber: number) => { setCurrentPage(pageNumber) };
    return (
        <div className="mt-2">
            {
                messages.length > 0 ?
                    <>
                        <h5>
                            Current Q/A :
                        </h5>
                        {
                            messages.map(message => (
                                <div key={message.id}>
                                    <div className="card mt-2 shadow p-3 bg-body rounded">
                                        <h5>Case #{message.id}: {message.title}</h5>
                                        <h6>{message.userEmail}</h6>
                                        <p>{message.question}</p>
                                        <hr />
                                        <div>
                                            <h5>Response:</h5>
                                            {
                                                message.response && message.adminEmail ?
                                                    <>
                                                        <h6>{message.adminEmail}</h6>
                                                        <p>{message.response}</p>
                                                    </>
                                                    :
                                                    <p><i>Pending response from administration. Please be patient.</i></p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </>
                    :
                    <div className="mt-3">
                        <h5>All questions you submit will be shown here</h5>

                    </div>
            }

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />}
        </div>
    );

}