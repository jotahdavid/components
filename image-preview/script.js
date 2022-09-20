const $imagePreview = document.querySelector('.profile-picture__preview');
const $profilePicture = document.querySelector('.profile-picture__image');
const $inputFile = document.querySelector('.profile-picture__file');

function handleProfilePictureChange() {
  const image = $inputFile.files[0];
  if (!image) return;

  const imageUrl = URL.createObjectURL(image);
  console.log(imageUrl);
  $profilePicture.src = imageUrl;
}

$inputFile.addEventListener('change', handleProfilePictureChange);

$inputFile.addEventListener('click', (event) => {
  event.stopPropagation();
});

$imagePreview.addEventListener('click', (event) => {
  event.preventDefault();
  $inputFile.click();
});
