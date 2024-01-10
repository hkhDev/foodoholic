import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
// import { faHeart as faHeartReg } from "@fortawesome/free-regular-svg-icons";
import {
  faTrash,
  faPen,
  faCaretDown,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import DelModal from "./DelModal";
import UpdateModal from "./UpdateModal";
import MapModal from "./MapModal";
import "./index.scss";
import { loadingEffect } from "../../Home";
import ImgCarousels from "./ImgCarousels";

const PostDetail = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(UserContext);
  const [post, setPost] = useState();
  const [postCreatedAt, setPostCreatedAt] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState("");
  const [delCommentModalShow, setDelCommentModalShow] = useState(false);
  const [editPostModalShow, setEditPostModalShow] = useState(false);
  const [mapModalShow, setMapModalShow] = useState(false);
  const [delPostModalShow, setDelPostModalShow] = useState(false);
  const { postId } = useParams();

  const handleEditPostModalClose = () => setEditPostModalShow(false);
  const handleEditPostModalShow = () => {
    setEditPostModalShow(true);
    document.body.click();
  };

  const handleDelPostModalClose = () => setDelPostModalShow(false);
  const handleDelPostModalShow = () => {
    setDelPostModalShow(true);
    document.body.click();
  };

  const handleMapModalClose = () => setMapModalShow(false);
  const handleMapModalShow = () => {
    setMapModalShow(true);
  };

  const handleDelCommentModalClose = () => setDelCommentModalShow(false);
  const handleDelCommentModalShow = () => setDelCommentModalShow(true);

  const getPost = () => {
    setIsLoading(true);
    axios
      .get(`/post/id/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        // console.log("Get post");
        // console.log(res.data.post);
        setPost(res.data.post);
        setAllComments(res.data.post.comments);
        setPostCreatedAt(
          new Date(res.data.post.createdAt).toLocaleDateString("en", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        );
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error.response.data);
        // setMessage({ title: "Warning!", body: error.response.data.error });
      });
  };

  const updatePost = (resName, resDetails, id) => {
    setIsLoading(true);
    axios
      .put(
        "/updatepost",
        {
          resName,
          resDetails,
          postId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setPost(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  const deletePost = (id) => {
    // console.log("del post api called");
    axios
      .delete(`/deletepost/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        // console.log(res.data);
        // console.log("post deleted");
        navigate(-1);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const makeComment = (text, id) => {
    axios
      .put(
        "/comment",
        {
          postId: id,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        // console.log("Add new comment");
        // console.log(res.data);
        setComment("");
        setAllComments(res.data.comments);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const deleteComment = (postId, commentId) => {
    // console.log("del comment api called");
    axios
      .put(
        "/deletecomment/",
        {
          postId,
          commentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        // console.log("comment deleted");
        setAllComments(res.data.comments);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  useEffect(() => {
    getPost();
    // console.log(post);
  }, []);
  return (
    <>
      {isLoading
        ? loadingEffect()
        : post && (
            <Container fluid>
              <Card className="post-detail">
                <Card.Header>
                  <Row>
                    <Col className="posted-by">
                      <LinkContainer
                        to={
                          post.postedBy._id === state._id
                            ? "/Profile"
                            : "/Profile/" + post.postedBy._id
                        }
                      >
                        <span className="hand-cursor">
                          {post.postedBy.name}{" "}
                        </span>
                      </LinkContainer>
                    </Col>
                    {post.postedBy._id === state._id && (
                      <Col className="posted-by-icon">
                        <OverlayTrigger
                          trigger="click"
                          placement="bottom"
                          rootClose
                          overlay={
                            <Popover id="">
                              <Popover.Body>
                                <Row>
                                  <Col xs={8}>Delete</Col>
                                  <Col xs={4}>
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      onClick={handleDelPostModalShow}
                                      className="delete-icon hand-cursor"
                                    />
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={8}>Edit</Col>
                                  <Col xs={4}>
                                    <FontAwesomeIcon
                                      icon={faPen}
                                      onClick={handleEditPostModalShow}
                                      className="edit-icon hand-cursor"
                                    />
                                  </Col>
                                </Row>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            className="hand-cursor"
                          />
                        </OverlayTrigger>
                      </Col>
                    )}
                  </Row>

                  <DelModal
                    modalTitle="Delete Post"
                    modalBody="Are you sure you want to delete the post?"
                    post={post}
                    delete={() => deletePost(postId)}
                    delModalShow={delPostModalShow}
                    handleDelModalShow={handleDelPostModalShow}
                    handleDelModalClose={handleDelPostModalClose}
                  />
                  <UpdateModal
                    modalTitle="Edit Post"
                    modalBody="Are you sure you want to Edit the post?"
                    post={post}
                    update={updatePost}
                    editModalShow={editPostModalShow}
                    handleEditModalShow={handleEditPostModalShow}
                    handleEditModalClose={handleEditPostModalClose}
                  />
                </Card.Header>
                {post.resImgsDetail.length > 1 ? (
                  <ImgCarousels imgDetail={post.resImgsDetail} />
                ) : (
                  <Card.Img variant="top" src={post.resImgsDetail[0].imgUrl} />
                )}
                <Card.Body>
                  <Card.Title className="res-name">
                    {post.resName} /
                    <span className="res-created-at"> {postCreatedAt}</span>
                  </Card.Title>
                  <Card.Text
                    className="res-location hand-cursor"
                    onClick={handleMapModalShow}
                  >
                    <FontAwesomeIcon icon={faLocationDot} />{" "}
                    {post.resFullAddress}
                  </Card.Text>
                  <MapModal
                    modalTitle="Address"
                    post={post}
                    mapModalShow={mapModalShow}
                    handleMapModalClose={handleMapModalClose}
                  />
                  <Row>
                    <Card.Text className="res-detail">
                      <LinkContainer
                        to={
                          post.postedBy._id === state._id
                            ? "/Profile"
                            : "/Profile/" + post.postedBy._id
                        }
                      >
                        <strong className="hand-cursor">
                          {post.postedBy.name}{" "}
                        </strong>
                      </LinkContainer>
                      {post.resDetails.map((resDetail) => (
                        <>
                          {resDetail} <br />
                        </>
                      ))}
                    </Card.Text>
                  </Row>
                  {Array.isArray(allComments) &&
                    allComments.map((comment) => {
                      return (
                        <Row key={comment._id}>
                          <Col xs={10} className="res-comment">
                            <Card.Text>
                              <LinkContainer
                                to={
                                  comment.postedBy._id === state._id
                                    ? "/Profile"
                                    : "/Profile/" + comment.postedBy._id
                                }
                              >
                                <strong className="hand-cursor">
                                  {comment.postedBy.name}{" "}
                                </strong>
                              </LinkContainer>
                              {comment.text}
                            </Card.Text>
                          </Col>
                          <Col xs={2} className="res-comment-delete">
                            {comment.postedBy._id === state._id && (
                              <FontAwesomeIcon
                                icon={faTrash}
                                onClick={handleDelCommentModalShow}
                                className="hand-cursor"
                              />
                            )}
                          </Col>
                          <DelModal
                            modalTitle="Delete Comment"
                            modalBody="Are you sure you want to delete the Comment?"
                            post={post}
                            delete={() => deleteComment(post._id, comment._id)}
                            delModalShow={delCommentModalShow}
                            handleDelModalShow={handleDelCommentModalShow}
                            handleDelModalClose={handleDelCommentModalClose}
                            commentId={comment._id}
                          />
                        </Row>
                      );
                    })}
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      makeComment(comment, postId);
                    }}
                  >
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <InputGroup className="mb-3">
                        <Form.Control
                          placeholder="New comment"
                          aria-label="Recipient's username"
                          aria-describedby="basic-addon2"
                          value={comment}
                          onChange={(e) => {
                            setComment(e.target.value);
                          }}
                        />

                        <Button
                          variant="outline-secondary"
                          type="submit"
                          disabled={comment === "" ? true : false}
                        >
                          Submit
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Container>
          )}
    </>
  );
};

export default PostDetail;
