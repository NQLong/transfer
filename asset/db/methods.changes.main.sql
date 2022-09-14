CREATE OR REPLACE FUNCTION SV_BAO_HIEM_Y_TE_SEARCH_PAGE(searchTerm IN STRING, filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NVARCHAR2(13);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;

    OPEN my_cursor FOR
    SELECT BHYT.MSSV                                             AS "mssv",
           FS.TEN                                                AS "ten",
           FS.HO                                                 AS "ho",
           FS.NGAY_SINH                                          AS "ngaySinh",
           (CASE WHEN FS.GIOI_TINH = 2 THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",

           xaThuongTru.TEN_PHUONG_XA                             as "xaThuongTru",
           huyenThuongTru.TEN_QUAN_HUYEN                         as "huyenThuongTru",
           tinhThuongTru.ten                                     as "tinhThuongTru",
           FS.THUONG_TRU_SO_NHA                                  AS "soNhaThuongTru",

           FS.DIEN_THOAI_CA_NHAN                                 AS "soDienThoaiCaNhan",

           BHYT.DIEN_DONG                                        AS "dienDong",
           BHYT.ID                                               AS "id",
           BHYT.BENH_VIEN_DANG_KY                                AS "benhVienDangKy",
           BHYT.GIA_HAN                                          AS "giaHan",
           BHYT.MA_BHXH_HIEN_TAI                                 AS "maBhxhHienTai",
           BHYT.MAT_SAU_THE                                      AS "matSauThe",
           BHYT.MAT_TRUOC_THE                                    AS "matTruocThe",
           kcb.TEN                                               AS "tenBenhVien"
    FROM SV_BAO_HIEM_Y_TE BHYT
             LEFT JOIN FW_STUDENT FS on BHYT.MSSV = FS.MSSV
             LEFT JOIN SV_BHYT_PHU_LUC_CHU_HO PLCH ON PLCH.ID_DANG_KY = BHYT.ID
             LEFT JOIN SV_BHYT_PHU_LUC_THANH_VIEN PLTV ON PLTV.ID_DANG_KY = BHYT.ID
             LEFT JOIN DM_PHUONG_THUC_TUYEN_SINH PTTS ON PTTS.MA = FS.PHUONG_THUC_TUYEN_SINH
             LEFT JOIN DM_PHUONG_XA xaThuongTru ON FS.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
             LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON FS.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
             LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON FS.THUONG_TRU_MA_TINH = tinhThuongTru.MA
             LEFT JOIN DM_CO_SO_KCB_BHYT kcb ON kcb.MA = BHYT.BENH_VIEN_DANG_KY
    WHERE searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR FS.MSSV LIKE ST;
     RETURN my_cursor;
end;

/
--EndMethod--