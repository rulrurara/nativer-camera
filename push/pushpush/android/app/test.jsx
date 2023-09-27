import React, { useState, useEffect } from 'react';
import { Pressable, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';  
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';  
import UploadModeModal from './UploadModeModal';  
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';

function Test() {
//백엔드에 보내기
const uploadImage = async (res) => {
  console.log("wwww");
  const formData = new FormData();
  formData.append('file', {
    uri: res.assets[0].uri,
    type: res.assets[0].type,  // 파일의 MIME 타입
    name: res.assets[0].fileName // 원본 파일 이름
  });

  try {
    const response = await axios.post('http://10.0.2.2:8080/ocr/upload', formData, {
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBQ0NFU1MiLCJpYXQiOjE2OTUxMDI1MTcsImV4cCI6MTY5NjMxMjExNywibWVtYmVyVXVpZCI6ImM1ODE5ODU0LTI4NmQtNDE2NC1iMDJjLWYzYjY1ZGYyMTgxZiJ9.JHAYB5ZXzG3mwobRZz7ZV7M9jZQz8wGnkQK3I1pidbxWscThzofi6CRbFzaF3Xf6LIzv1V5V5fPluRfdxgCYqA',
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};
//카메라 허용
  async function requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "카메라 권한 필요",
          message: "이 앱은 카메라 권한이 필요합니다.",
          buttonNeutral: "나중에",
          buttonNegative: "취소",
          buttonPositive: "확인"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("카메라 권한이 허용되었습니다.");
        return true;
      } else {
        console.log("카메라 권한이 거부되었습니다.");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  
//스토리지 허용
  async function requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "저장소 권한 필요",
          message: "이 앱은 저장소 권한이 필요합니다.",
          buttonNeutral: "나중에",
          buttonNegative: "취소",
          buttonPositive: "확인"
        }
      );

      switch (granted) {
        case PermissionsAndroid.RESULTS.GRANTED:
          console.log("저장소 권한이 허용되었습니다.");
          return true;
        case PermissionsAndroid.RESULTS.DENIED:
          console.log("저장소 권한이 거부되었습니다.");
          return false;
        case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
          console.log("저장소 권한을 다시 묻지 않기로 설정되었습니다.");
          return false;
        default:
          return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
}


  const imagePickerOption = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };
//선택 또는 찍은 사진 정보
  const onPickImage = async (res) => { 
    if (res.didCancel || !res || !res.assets || !res.assets[0]) {
      return;
    }
  
    console.log("PickImage", res);
    // 백으로 보내기 호출
    await uploadImage(res);
  };
//카메라 찍기
  const onLaunchCamera = async () => {
    const hasStoragePermission = await requestStoragePermission();
    const hasCameraPermission = await requestCameraPermission();
    if (hasStoragePermission && hasCameraPermission) {
      launchCamera(imagePickerOption, onPickImage);
    }
  };
//사진 선택
  const onLaunchImageLibrary = async () => {
    const hasPermission = await requestStoragePermission();
    if (hasPermission) {
      launchImageLibrary(imagePickerOption, onPickImage);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  const modalOpen = () => {
    if (Platform.OS === "android") {
      setModalVisible(true);
    }
  }

  return (
    <>
      <View>
        <Pressable style={{ padding: 10, backgroundColor: 'blue' }} onPress={modalOpen}>
          <Icon name="camera-alt" color="white" size={24} />
        </Pressable>
      </View>
      <UploadModeModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onLaunchCamera={onLaunchCamera}
        onLaunchImageLibrary={onLaunchImageLibrary} />
    </>
  );
}

export default Test;
