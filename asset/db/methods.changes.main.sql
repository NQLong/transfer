CREATE OR REPLACE FUNCTION DT_DANH_SACH_MON_MO_GET_CURRENT(TG_MO_MON IN STRING, CHUONG_TRINH_DAO_TAO OUT SYS_REFCURSOR,
                                                THONG_TIN OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    DANH_SACH_MON_MO  SYS_REFCURSOR;
    KHOA_SINH_VIEN    NUMBER(4);
    HOC_KY_MO_MON     NUMBER(1);
    ID_DANG_KY_MO_MON NUMBER;
BEGIN
    SELECT JSON_VALUE(TG_MO_MON, '$.khoa') INTO KHOA_SINH_VIEN FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.hocKy') INTO HOC_KY_MO_MON FROM DUAL;
    SELECT JSON_VALUE(TG_MO_MON, '$.idDangKyMoMon') INTO ID_DANG_KY_MO_MON FROM DUAL;

    OPEN THONG_TIN FOR
        SELECT DKMM.KHOA              AS "khoaDangKy",
               DKMM.MA_NGANH          AS "maNganh",
               NDT.TEN_NGANH          AS "tenNganh",
               DV.TEN                 AS "tenKhoaDangKy",
               DKMM.IS_DUYET          AS "isDuyet",
               DKMM.LOAI_HINH_DAO_TAO AS "loaiHinhDaoTao",
               DKMM.BAC_DAO_TAO       AS "bacDaoTao"
        FROM DT_DANG_KY_MO_MON DKMM
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = DKMM.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = DKMM.KHOA
        WHERE DKMM.ID = ID_DANG_KY_MO_MON;

    OPEN CHUONG_TRINH_DAO_TAO FOR
        SELECT CTDT.MA_MON_HOC        AS "maMonHoc",
               MH.TEN                 AS "tenMonHoc",
               CTDT.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               CTDT.SO_TIET_THUC_HANH AS "soTietThucHanh",
               CTDT.HOC_KY_DU_KIEN    AS "hocKyDuKien",
               CTDT.LOAI_MON_HOC      AS "loaiMonHoc",
               CTDT.KHOA              AS "khoa",
               MH.KHOA                AS "monHocKhoa",
               CTDT.TONG_SO_TIET      AS "tongSoTiet",
               CTKDT.KHOA             AS "khoaSinhVien"

        FROM DT_CHUONG_TRINH_DAO_TAO CTDT
                 LEFT JOIN DT_KHUNG_DAO_TAO KDT ON KDT.ID = CTDT.MA_KHUNG_DAO_TAO
                 LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT on KDT.NAM_DAO_TAO = CTKDT.ID
                 LEFT JOIN DT_DANG_KY_MO_MON DKMM ON DKMM.MA_NGANH = KDT.MA_NGANH
                 LEFT JOIN DM_MON_HOC MH ON MH.MA = CTDT.MA_MON_HOC
        WHERE DKMM.ID = ID_DANG_KY_MO_MON
            AND MH.KHOA != 33
            AND
            --E.g: Current Semester: 1, Current Year: 2022
              (CTKDT.KHOA = KHOA_SINH_VIEN AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON)         -- Student 2022 - Sem 1
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 1 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 2) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 2 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 4) -- Student 2021 - Sem 3
           OR (CTKDT.KHOA = KHOA_SINH_VIEN - 3 AND CTDT.HOC_KY_DU_KIEN = HOC_KY_MO_MON + 6) -- Student 2021 - Sem 3
    ;


    OPEN DANH_SACH_MON_MO FOR
        SELECT DS.MA_MON_HOC        as "maMonHoc",
               DS.TEN_MON_HOC       AS "tenMonHoc",
               DS.LOAI_MON_HOC      AS "loaiMonHoc",
               DS.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               DS.SO_TIET_THUC_HANH AS "soTietThucHanh",
               DS.NAM               AS "nam",
               DS.HOC_KY            AS "hocKy",
               DS.MA_NGANH          AS "maNganh",
               DS.CHUYEN_NGANH      AS "chuyenNganh",
               DS.ID                AS "id",
               DS.SO_LOP            AS "soLop",
               DS.SO_BUOI_TUAN      AS "soBuoiTuan",
               DS.SO_TIET_BUOI      AS "soTietBuoi",
               DS.SO_LUONG_DU_KIEN  AS "soLuongDuKien",
               DS.KHOA              AS "monHocKhoa",
               DS.KHOA_SV           AS "khoaSv",
--                CN.TEN               AS "tenChuyenNganh",
               DS.MA_DANG_KY        AS "maDangKy"
        FROM DT_DANH_SACH_MON_MO DS
--                  LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = DS.CHUYEN_NGANH
        WHERE DS.MA_DANG_KY = ID_DANG_KY_MO_MON;

    return DANH_SACH_MON_MO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION FW_STUDENT_GET_DATA(iMssv IN STRING) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;

BEGIN
    OPEN STUDENT_INFO FOR
        SELECT STU.MSSV                                               AS "mssv",
               (STU.HO || ' ' || STU.TEN)                             AS "hoTen",
               STU.EMAIL_CA_NHAN                                      AS "emailCaNhan",
               STU.EMAIL_TRUONG                                       AS "emailTruong",
               STU.NGAY_SINH                                          AS "ngaySinh",
               (CASE WHEN STU.GIOI_TINH = 2 THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",
               TTSV.TEN                                               AS "noiSinh",
               NDT.TEN_NGANH                                          AS "tenNganh",
               STU.DIEN_THOAI_CA_NHAN                                 AS "sdt",
               TONGIAO.TEN                                            AS "tonGiao",
               QG.TEN_QUOC_GIA                                        AS "quocTich",
               DANTOC.TEN                                             AS "danToc",
               STU.DOI_TUONG_TUYEN_SINH                               AS "doiTuongTuyenSinh",
               STU.DOI_TUONG_CHINH_SACH                               AS "doiTuongChinhSach",
               STU.KHU_VUC_TUYEN_SINH                                 AS "khuVucTuyenSinh",
               PTTS.TEN                                               AS "phuongThucTuyenSinh",
               STU.DIEM_THI                                           AS "diemThi",
               STU.CMND                                               AS "cmnd",
               STU.CMND_NGAY_CAP                                      AS "cmndNgayCap",
               STU.CMND_NOI_CAP                                       AS "cmndNoiCap",
               STU.TEN_CHA                                            AS "tenCha",
               STU.NGAY_SINH_CHA                                      AS "ngaySinhCha",
               STU.NGHE_NGHIEP_CHA                                    AS "ngheNghiepCha",
               STU.SDT_CHA                                            AS "sdtCha",

               STU.TEN_ME                                             AS "tenMe",
               STU.NGAY_SINH_ME                                       AS "ngaySinhMe",
               STU.NGHE_NGHIEP_ME                                     AS "ngheNghiepMe",
               STU.SDT_ME                                             AS "sdtMe",
               STU.IMAGE                                              AS "image",
               STU.LAST_MODIFIED                                      AS "lastModified",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               STU.THUONG_TRU_SO_NHA                                  AS "soNhaThuongTru",

               xaThuongTruCha.TEN_PHUONG_XA                           as "xaThuongTruCha",
               huyenThuongTruCha.TEN_QUAN_HUYEN                       as "huyenThuongTruCha",
               tinhThuongTruCha.ten                                   as "tinhThuongTruCha",
               STU.THUONG_TRU_SO_NHA_CHA                              AS "soNhaThuongTruCha",

               xaThuongTruMe.TEN_PHUONG_XA                            as "xaThuongTruMe",
               huyenThuongTruMe.TEN_QUAN_HUYEN                        as "huyenThuongTruMe",
               tinhThuongTruMe.ten                                    as "tinhThuongTruMe",
               STU.THUONG_TRU_SO_NHA_ME                               AS "soNhaThuongTruMe",

               tinhLienLac.TEN                                        AS "tinhLienLac",
               huyenLienLac.TEN_QUAN_HUYEN                            AS "huyenLienLac",
               xaLienLac.TEN_PHUONG_XA                                AS "xaLienLac",
               STU.LIEN_LAC_SO_NHA                                    AS "soNhaLienLac",

               STU.HO_TEN_NGUOI_LIEN_LAC                              AS "hoTenNguoiLienLac",
               STU.SDT_NGUOI_LIEN_LAC                                 AS "sdtNguoiLienLac",
               STU.NGAY_VAO_DOAN                                      as "ngayVaoDoan",
               STU.NGAY_VAO_DANG                                      AS "ngayVaoDang"

        FROM FW_STUDENT STU
                 LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                 LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                 LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                 LEFT JOIN DM_TINH_THANH_PHO TTSV ON TTSV.MA = STU.NOI_SINH_MA_TINH
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN DM_PHUONG_THUC_TUYEN_SINH PTTS ON PTTS.MA = STU.PHUONG_THUC_TUYEN_SINH
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA


                 LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                           ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

                 LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

                 LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_XA = xaLienLac.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_TINH = tinhLienLac.MA
        WHERE STU.MSSV = iMssv;
    RETURN STUDENT_INFO;
end ;

/
--EndMethod--