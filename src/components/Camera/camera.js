import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import CameraList from "./CameraList";
import CameraZone from "./CameraZone";
import BottomNavigation from "../footer/bottom-nav";
import Alert from "../alert/alert";
// import selected from "../../data/selectedCamera";
import Axios from "axios";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    // height:"100%"
  },
  SubTitle: {
    color: "white",
    display: "flex",
    alignItems: "center",
    fontSize: "28px",
    justifyContent: "flex-start",
    // padding: "10px 20px",
  },
}));
export const Camera = (props) => {
  const { setValue, value } = props;
  const classes = useStyles();
  const [allCamera, setAllCamera] = useState([]);
  const [selectedCamera, setSelectedCamList] = useState([]);
  const [result, setResult] = useState([]);
  const [msg, setMsg] = useState("");
  const [defaultCam, setDefaultCam] = useState(0);

  const [openAlert, setOpenAlert] = React.useState(false);

  const handleClickAlert = () => {
    setOpenAlert(true);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAlert(false);
  };

  const deleteCard = (camera) => {
    setResult((result) => result.concat(camera).sort());
    setSelectedCamList(
      selectedCamera.filter((item) => item.camera_id !== camera.camera_id)
    );
  };

  useEffect(() => {
    Axios.get("http://shark-api-v2.herokuapp.com/api/camera/fetch/all")
      .then((res) => {
        setAllCamera(res.data.data);
        setResult(res.data.data);
        // setLoad(true);
      })
      .catch((err) => {
        // setError(err.message);
        // setLoad(true);
      });
  }, []);

  const handleChangeSearch = (event) => {
    setResult(
      allCamera.filter((camera) =>
        camera["name"].toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };
  const handleSubmit = () => {
    let camId = [];
    selectedCamera.map((cam) => {
      camId.push(cam.camera_id);
    });
    localStorage.setItem("cameras", JSON.stringify(selectedCamera));
    console.log("camList", camId.length);
    if (camId.length === 0 || defaultCam === null) {
      handleClickAlert();
    } else {
      setMsg("Default camera is not selected");
      let id = localStorage.getItem("zone_id");

      let data = {
        zone_id: id,
        camera_id: camId,
        default_camera_id: camId[0],
        created_by: "Test",
      };
      Submit(data);
      console.log("data", camId, defaultCam);
      setValue(value + 1);
    }
  };

  const Submit = (data) => {
    Axios.post("http://shark-api-v2.herokuapp.com/api/zone/camera-map", data)
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const afterDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrag = (e) => {
    console.log("handling drag =>", e.target.id);
    e.dataTransfer.setData("cameraId", e.target.id);
  };

  const afterDrop = (e) => {
    e.preventDefault();
    const darggedCamId = e.dataTransfer.getData("cameraId");
    const draggedCamera = result.find(
      ({ camera_id }) => String(camera_id) === darggedCamId
    );
    if (!draggedCamera) return;

    selectedCamera.push(draggedCamera);
    let updatedList = result.filter(
      ({ camera_id }) => String(camera_id) !== darggedCamId
    );

    setResult(updatedList);
    setSelectedCamList([...selectedCamera]);
  };

  return (
    <Grid container className={classes.root} spacing={2}>
      <Grid item lg={3} sm={12} xl={3} xs={12}>
        <CameraList
          allCamera={result}
          searchTerm={"Search Camera"}
          handleChangeSearch={handleChangeSearch}
          handleDrag={handleDrag}
        />
      </Grid>
      <Grid item lg={9} sm={12} xl={9} xs={12}>
        <Grid style={{ height: "79vh", maxHeight: "79vh" }}>
          <CameraZone
            deleteCard={deleteCard}
            selectedCamera={selectedCamera}
            defaultCam={defaultCam}
            setDefaultCam={setDefaultCam}
            afterDrop={afterDrop}
            afterDragOver={afterDragOver}
          />
        </Grid>
      </Grid>
      <Grid item lg={12} sm={12} xl={12} xs={12}>
        <BottomNavigation
          start={0}
          end={4}
          value={value}
          handleSubmit={handleSubmit}
          setValue={setValue}
          data={selectedCamera}
        />
        <Alert
          openAlert={openAlert}
          handleClickAlert={handleClickAlert}
          handleCloseAlert={handleCloseAlert}
          msg={msg}
        />
      </Grid>
    </Grid>
  );
};
