import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
// import {
//   geocodeByAddress,
//   getLatLng,
//   geocodeByLatLng,
// } from "react-google-places-autocomplete";
import "./index.scss";
// import { LinkContainer } from "react-router-bootstrap";

const CreatePost = () => {
  const navigate = useNavigate();
  const [resImgs, setResImgs] = useState([]);
  const [resName, setResName] = useState("");
  // const [resLocation, setResLocation] = useState("");
  const [resDetailsString, setResDetailsString] = useState("");
  const [resImgsDetail, setResImgsDetail] = useState([]);
  const [uploadedImgNum, setUploadedImgNum] = useState(0);
  const [validated, setValidated] = useState(false);
  const [validatedImg, setValidatedImg] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [imgLimit, setImgLimit] = useState(false);
  const [displayImgLimitMsg, setDisplayImgLimitMsg] = useState(false);
  const resLocation = useRef();

  const [libraries] = useState(["places"]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_Google_Maps_Api_Key,
    libraries,
  });

  const imgMax = 10;

  const handleSubmit = (event) => {
    // console.log(resLocation.current.value);
    event.preventDefault();

    const form = event.currentTarget;
    resImgs.length < 1 ? setValidatedImg(false) : setValidatedImg(true);
    if (form.checkValidity() === false) {
      event.preventDefault();
      // event.stopPropagation();
    } else {
      uploadImg(event);
    }
    setValidated(true);
  };

  const handleFileEvent = (imgs) => {
    const chosenFiles = Array.prototype.slice.call(imgs);
    // console.log(chosenFiles);
    handledSelectedFiles(chosenFiles);
    setValidatedImg(true);
  };

  const handledSelectedFiles = (imgs) => {
    const selectedImg = [...resImgs];
    let limitExceeded = false;

    imgs.some((img) => {
      if (selectedImg.findIndex((f) => f.name === img.name) === -1) {
        selectedImg.push(img);
        if (selectedImg.length === imgMax) {
          setImgLimit(true);
        }
        if (selectedImg.length > imgMax) {
          setDisplayImgLimitMsg(true);
          // alert(`You can only add ${imgMax} images`);
          setImgLimit(false);
          limitExceeded = true;
          return true;
        }
      }
    });
    // console.log(`All uploaded img:`);
    if (!limitExceeded) {
      setResImgs(selectedImg);
      setDisplayImgLimitMsg(false);
    }
  };

  const deleteSelectedImg = (img) => {
    setResImgs(resImgs.filter((resImg) => resImg.name !== img.name));
    setImgLimit(false);
  };

  const uploadImg = (event) => {
    event.preventDefault();
    setIsLoading(true);
    let uploadedImage = 0;
    // console.log(resImgs);
    const uploadedImageDetails = [];
    resImgs.forEach((resImg) => {
      const formData = new FormData();
      formData.append("file", resImg);
      formData.append("upload_preset", "food-review");
      formData.append("cloud-name", "harriscloud");
      axios
        .post(
          "https://api.cloudinary.com/v1_1/harriscloud/image/upload",
          formData
        )
        .then((res) => {
          uploadedImageDetails.push({
            imgUrl: res.data.secure_url,
            imgId: res.data.public_id,
          });
          uploadedImage = uploadedImage + 1;
          // console.log(uploadedImageDetails);
          setResImgsDetail(uploadedImageDetails);
          setUploadedImgNum(uploadedImage);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  const uploadPost = () => {
    let resDetails = resDetailsString.split("\n");
    console.log(resDetails);
    axios
      .post(
        "/createpost",
        {
          resName,
          resLocation: resLocation.current.value,
          resDetails,
          resImgsDetail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        // console.log("upload post");
        // console.log(res.data);
        setResImgs([]);
        setResName("");
        // setResLocation("");
        setResDetailsString({});
        setResImgsDetail();
        setIsLoading(false);
        navigate("/");
      })
      .catch((error) => {
        console.log(error.response.data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    uploadedImgNum > 0 &&
      resImgsDetail.length === resImgs.length &&
      uploadPost();
  }, [uploadedImgNum]);

  return (
    <>
      {isLoaded && (
        <Container fluid className="create-post">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formResImgs">
              <Form.Control
                required
                style={{ display: "none" }}
                type="file"
                multiple
                onChange={(e) => {
                  handleFileEvent(e.target.files);
                }}
                disabled={imgLimit}
              />
              <label htmlFor="formResImgs">
                <a
                  className={imgLimit ? "btn btn-secondary" : "btn btn-primary"}
                >
                  Upload Files (max 10)
                </a>{" "}
                {!validatedImg && (
                  <span className="img-error-msg">Please upload image</span>
                )}
                {displayImgLimitMsg && (
                  <span className="img-error-msg">Image Limit Exceeded</span>
                )}
              </label>
            </Form.Group>
            {resImgs &&
              resImgs.map((img, index) => {
                return (
                  <Container fluid key={index}>
                    <Row className="selected-image">
                      <Col xs={10}>{img.name} </Col>
                      <Col xs={2} className="deleteIcon">
                        <FontAwesomeIcon
                          icon={faX}
                          onClick={() => {
                            deleteSelectedImg(img);
                          }}
                        />
                      </Col>
                    </Row>
                  </Container>
                );
              })}

            <Form.Group className="mb-3" controlId="formResName">
              <FloatingLabel
                controlId="floatingInput"
                label="Restaurant Name"
                className="mb-3"
              >
                <Form.Control
                  required
                  type="text"
                  placeholder="Restaurant Name"
                  value={resName}
                  onChange={(e) => {
                    setResName(e.target.value);
                  }}
                />
              </FloatingLabel>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formResLocation">
              <Autocomplete
                options={{
                  componentRestrictions: { country: ["ca"] },
                  // language: "en",
                }}
                onSelect={(e) => console.log(e.target.value)}
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Restaurant Location"
                  className="mb-3"
                >
                  <Form.Control
                    required
                    type="text"
                    placeholder="Restaurant Location"
                    // value={resLocation}
                    // onChange={(e) => {
                    //   console.log(e.target.value);
                    //   setResLocation(e.target.value);
                    // }}
                    ref={resLocation}
                  />
                </FloatingLabel>
              </Autocomplete>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formResDetailsString">
              <FloatingLabel controlId="floatingPassword" label="Details">
                <Form.Control
                  required
                  as="textarea"
                  aria-label="With textarea"
                  placeholder="Details"
                  value={resDetailsString}
                  onChange={(e) => {
                    setResDetailsString(e.target.value);
                  }}
                />
              </FloatingLabel>
            </Form.Group>

            {isLoading ? (
              <Button variant="primary" type="submit" disabled>
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Uploading...
              </Button>
            ) : (
              <Button variant="primary" type="submit">
                Submit
              </Button>
            )}
          </Form>
        </Container>
      )}
    </>
  );
};

export default CreatePost;
