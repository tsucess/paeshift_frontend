import Swal from 'sweetalert2';
import successIcon from "../assets/images/success.png";


export const confirmModalSwal = (title1, text1, title2, text2, title3,text3) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            swalWithBootstrapButtons.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            });
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire({
                title: "Cancelled",
                text: "Your imaginary file is safe :)",
                icon: "error"
            });
        }
    });

}





// Helper: Show SweetAlert2 success dialog
export const showSuccessSwal = (title, text) => {
    Swal.fire({
        title,
        text,
        imageUrl: successIcon,
        imageWidth: 80,
        imageHeight: 80,
        imageAlt: "Success",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
            image: 'swal-custom-image',
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-html',
        },
        background: '#FFFFFF',
    });
};

// Helper: Show SweetAlert2 error dialog
export const showErrorSwal = (title, text) => {
    Swal.fire({
        title,
        text,
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-html',
        },
        background: '#FFFFFF',
    });
};

// Custom SweetAlert2 styles
// You can move this to a CSS/SCSS file if preferred
const swalCustomStyles = document.createElement('style');
swalCustomStyles.innerHTML = `
  .swal-custom-popup {
    border-radius: 24px !important;
    padding: 24px !important;
    background-color: #FFFFFF !important;
  }
`;

  if (!document.getElementById('swal-custom-styles')) {
    swalCustomStyles.id = 'swal-custom-styles';
    document.head.appendChild(swalCustomStyles);
  }