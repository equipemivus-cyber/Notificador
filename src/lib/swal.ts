import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * Toast básico para notificações rápidas no canto superior direito
 */
export const toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/**
 * Alerta de confirmação padronizado
 * @param title Título do alerta
 * @param text Texto descritivo
 * @param icon Ícone (warning, info, question, etc)
 * @returns Promise<boolean> true se confirmado, false caso contrário
 */
export const confirmAction = async (
    title: string = 'Tem certeza?',
    text: string = 'Você não poderá reverter esta ação!',
    icon: 'warning' | 'error' | 'success' | 'info' | 'question' = 'warning'
): Promise<boolean> => {
    const result = await MySwal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, confirmar!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    return result.isConfirmed;
};

/**
 * Alerta simples de sucesso ou erro
 */
export const showAlert = (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'info' | 'warning' = 'success'
) => {
    return MySwal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#3085d6',
    });
};

export default MySwal;
