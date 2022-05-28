CREATE OR REPLACE FUNCTION TCHC_CAN_BO_GET_DATA_ALL(mtcb IN STRING, QT_CHUC_VU OUT SYS_REFCURSOR, QT_DAO_TAO OUT SYS_REFCURSOR,
                                         QT_HOC_TAP_CONG_TAC OUT SYS_REFCURSOR,
                                         TO_CHUC_KHAC OUT SYS_REFCURSOR,
                                         QUAN_HE_GIA_DINH OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    CAN_BO SYS_REFCURSOR;
BEGIN

    OPEN CAN_BO FOR
        SELECT STAFF.SHCC                                             AS "shcc",
               STAFF.HO                                               AS "ho",
               STAFF.TEN                                              AS "ten",
               STAFF.BI_DANH                                          AS "otherName",
               staff.NGAY_SINH                                        as "ngaySinh",
               (CASE WHEN staff.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",

               xaNoiSinh.TEN_PHUONG_XA                                as "xaNoiSinh",
               huyenNoiSinh.TEN_QUAN_HUYEN                            as "huyenNoiSinh",
               tinhNoiSinh.TEN                                        AS "tinhNoiSinh",

               xaNguyenQuan.TEN_PHUONG_XA                             AS "xaNguyenQuan",
               huyenNguyenQuan.TEN_QUAN_HUYEN                         AS "huyenNguyenQuan",
               tinhNguyenQuan.TEN                                     AS "tinhNguyenQuan",

               danToc.TEN                                             as "danToc",
               tonGiao.TEN                                            as "tonGiao",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               staff.THUONG_TRU_SO_NHA                                as "soNhaThuongTru",

               xaHienTai.TEN_PHUONG_XA                                as "xaHienTai",
               huyenHienTai.TEN_QUAN_HUYEN                            as "huyenHienTai",
               tinhHienTai.ten                                        as "tinhHienTai",
               staff.HIEN_TAI_SO_NHA                                  as "soNhaHienTai",

               staff.NGHE_NGHIEP_CU                                   as "ngheTuyen",
               staff.NGAY_BAT_DAU_CONG_TAC                            as "ngayTuyen",
               staff.DON_VI_TUYEN_DUNG                                as "coQuanTuyen",
               staff.NGACH                                            as "maNgach",
               ngach.TEN                                              as "tenNgach",
               staff.NGAY_HUONG_LUONG                                 as "ngayHuongLuong",
               staff.BAC_LUONG                                        as "bacLuong",
               staff.HE_SO_LUONG                                      as "heSoLuong",
               staff.TRINH_DO_PHO_THONG                               as "phoThong",
               hocVi.TEN                                              as "hocVi",
               staff.NGAY_VAO_DANG                                    as "ngayVaoDang",
               staff.NGAY_VAO_DANG_CHINH_THUC                         as "ngayVaoDangChinhThuc",
               staff.NGAY_NHAP_NGU                                    as "ngayNhapNgu",
               staff.NGAY_XUAT_NGU                                    as "ngayXuatNgu",
               staff.QUAN_HAM_CAO_NHAT                                as "quanHam",
               staff.SO_TRUONG                                        as "soTruong",
               staff.SUC_KHOE                                         as "sucKhoe",
               staff.CHIEU_CAO                                        as "chieuCao",
               staff.CAN_NANG                                         as "canNang",
               nhomMau.TEN                                            as "nhomMau",
               staff.HANG_THUONG_BINH                                 as "hangThuongBinh",
               staff.GIA_DINH_CHINH_SACH                              as "giaDinhChinhSach",
               staff.CMND                                             as "cmnd",
               staff.CMND_NGAY_CAP                                    as "ngayCapCmnd",
               staff.CMND_NOI_CAP                                     as "noiCapCmnd",
               staff.SO_BHXH                                          as "soBaoHiemXaHoi",
               (select rtrim(xmlagg(xmlelement(e, daoTao.CHUYEN_NGANH, ' - ', daoTao.TRINH_DO, ', ').extract('//text()') order by
                                    null).getclobval(), ', ')
                FROM QT_DAO_TAO daoTao
                 LEFT JOIN DM_BANG_DAO_TAO bdt on daoTao.LOAI_BANG_CAP = bdt.MA
                WHERE daoTao.SHCC = mtcb AND daoTao.LOAI_BANG_CAP = 5)       AS "ngoaiNgu"
        FROM TCHC_CAN_BO STAFF
                 LEFT JOIN DM_PHUONG_XA xaNoiSinh
                           ON STAFF.MA_XA_NOI_SINH = xaNoiSinh.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNoiSinh ON huyenNoiSinh.MA_QUAN_HUYEN = STAFF.MA_HUYEN_NOI_SINH
                 LEFT JOIN DM_TINH_THANH_PHO tinhNoiSinh ON STAFF.MA_TINH_NOI_SINH = tinhNoiSinh.MA
                 LEFT JOIN DM_PHUONG_XA xaNguyenQuan ON STAFF.MA_XA_NGUYEN_QUAN = xaNguyenQuan.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNguyenQuan ON STAFF.MA_HUYEN_NGUYEN_QUAN = huyenNguyenQuan.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhNguyenQuan ON STAFF.MA_TINH_NGUYEN_QUAN = tinhNguyenQuan.MA
                 LEFT JOIN DM_DAN_TOC danToc ON STAFF.DAN_TOC = danToc.MA
                 LEFT JOIN DM_TON_GIAO tonGiao ON STAFF.TON_GIAO = tonGiao.MA
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STAFF.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STAFF.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STAFF.THUONG_TRU_MA_TINH = tinhThuongTru.MA
                 LEFT JOIN DM_PHUONG_XA xaHienTai ON STAFF.HIEN_TAI_MA_XA = xaHienTai.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenHienTai ON STAFF.HIEN_TAI_MA_HUYEN = huyenHienTai.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhHienTai ON STAFF.HIEN_TAI_MA_TINH = tinhHienTai.MA
                 LEFT JOIN DM_NGACH_CDNN ngach ON ngach.MA = staff.NGACH
                 left join DM_TRINH_DO hocVi ON hocVi.MA = staff.HOC_VI
                 LEFT JOIN DM_NHOM_MAU nhomMau ON nhomMau.MA = staff.NHOM_MAU
        WHERE STAFF.SHCC = mtcb;

    OPEN QT_CHUC_VU FOR
        SELECT DM_DON_VI.TEN      AS "donVi",
               DM_CHUC_VU.TEN     AS "chucVu",
               DM_CHUC_VU.PHU_CAP as "phuCapChucVu"
        FROM (SELECT MAX(cv1.NGAY_RA_QD) AS maxNgayRaQD
              FROM QT_CHUC_VU cv1
              WHERE cv1.SHCC = mtcb
                AND cv1.CHUC_VU_CHINH = 1
              GROUP BY cv1.SHCC) cvMax
                 INNER JOIN QT_CHUC_VU cv ON cv.NGAY_RA_QD = cvMax.maxNgayRaQD
                 LEFT JOIN DM_CHUC_VU ON DM_CHUC_VU.MA = CV.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI ON DM_DON_VI.MA = CV.MA_DON_VI
                 LEFT JOIN DM_BO_MON ON DM_BO_MON.MA = CV.MA_BO_MON
        WHERE cv.SHCC = mtcb;

    OPEN QUAN_HE_GIA_DINH FOR
        SELECT quanhe.HO_TEN       AS "hoTen",
               quanhe.NAM_SINH     AS "namSinh",
               quanhe.NGHE_NGHIEP  AS "ngheNghiep",
               quanhe.NOI_CONG_TAC AS "noiCongTac",
               qh.TEN              AS "moiQuanHe",
               qh.LOAI             AS "loai"
        FROM QUAN_HE_CAN_BO quanhe
                 LEFT JOIN DM_QUAN_HE_GIA_DINH qh ON quanhe.MOI_QUAN_HE = qh.MA
        WHERE quanhe.SHCC = mtcb;

    OPEN QT_HOC_TAP_CONG_TAC FOR
        SELECT HTCT.BAT_DAU       as "batDau",
               HTCT.KET_THUC_TYPE as "ketThucType",
               HTCT.KET_THUC      as "ketThuc",
               htct.BAT_DAU_TYPE  as "batDauType",
               HTCT.NOI_DUNG      as "noiDung"
        FROM QT_HOC_TAP_CONG_TAC HTCT
        where htct.SHCC = mtcb;

    open TO_CHUC_KHAC FOR
        SELECT tck.NGAY_THAM_GIA as "ngayThamGia",
               tck.TEN_TO_CHUC   as "tenToChuc",
               tck.MO_TA         as "moTa"
        FROM TCCB_TO_CHUC_KHAC TCK
        where tck.SHCC = mtcb;

    open QT_DAO_TAO for
        select qtdt.TEN_TRUONG    as "coSo",
               qtdt.CHUYEN_NGANH  as "chuyenNganh",
               qtdt.BAT_DAU       as "batDau",
               qtdt.BAT_DAU_TYPE  as "batDauType",
               qtdt.KET_THUC      as "ketThuc",
               qtdt.KET_THUC_TYPE as "ketThucType",
               qtdt.HINH_THUC     as "hinhThuc",
               qtdt.LOAI_BANG_CAP as "loaiBangCap",
               qtdt.TRINH_DO      as "trinhDo",
               bdt.TEN            as "tenLoaiBangCap",
               htdt.TEN           as "tenHinhThuc",
               TDDT.TEN           AS "tenTrinhDo"
        from QT_DAO_TAO qtdt
                 LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                 LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
        where qtdt.SHCC = mtcb AND qtdt.KET_THUC != -1;

    return CAN_BO;
END;

/
--EndMethod--

