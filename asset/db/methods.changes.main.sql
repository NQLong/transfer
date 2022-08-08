CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_GET_FREE(config IN STRING, hocPhanDaXep OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    my_cursor     SYS_REFCURSOR;
    listIdNganh   STRING(500);
    bac           STRING(10);
    he            STRING(10);
    khoaSv        STRING(4);
    namHoc        STRING(100);
    hocKy         STRING(1);
    listIdHocPhan STRING(500);
begin
    SELECT JSON_VALUE(config, '$.listIdNganh') INTO listIdNganh FROM DUAL;
    SELECT JSON_VALUE(config, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(config, '$.loaiHinhDaoTao') INTO he FROM DUAL;
    SELECT JSON_VALUE(config, '$.khoaSinhVien') INTO khoaSv FROM DUAL;
    SELECT JSON_VALUE(config, '$.nam') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocKy') INTO hocKy FROM DUAL;

    SELECT LISTAGG(TMP.ID_THOI_KHOA_BIEU, ',') WITHIN GROUP ( ORDER BY TMP.ID_THOI_KHOA_BIEU)
    INTO listIdHocPhan
    FROM (
    SELECT DISTINCT TKBN.ID_THOI_KHOA_BIEU
    FROM DT_THOI_KHOA_BIEU_NGANH TKBN
    WHERE TKBN.ID_NGANH IN
          (SELECT regexp_substr(listIdNganh, '[^,]+', 1, level)
           from dual
           connect by regexp_substr(listIdNganh, '[^,]+', 1, level) is not null)) TMP;

    open hocPhanDaXep FOR
        SELECT TKB.ID                                  AS "id",
               TKB.MA_MON_HOC                          AS "maMonHoc",
               TKB.THU                                 AS "thu",
               TKB.TIET_BAT_DAU                        AS "tietBatDau",
               TKB.SO_TIET_BUOI                        AS "soTietBuoi",
               TKB.TIET_BAT_DAU + TKB.SO_TIET_BUOI - 1 AS "tietKetThuc"
        FROM DT_THOI_KHOA_BIEU TKB
        WHERE TKB.ID IN (SELECT regexp_substr(listIdHocPhan, '[^,]+', 1, level)
                         from dual
                         connect by regexp_substr(listIdHocPhan, '[^,]+', 1, level) is not null)
          AND TKB.THU IS NOT NULL
          AND TKB.TIET_BAT_DAU IS NOT NULL
          AND TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy;

    open my_cursor for
        select TKB.ID                AS "id",
               TKB.MA_MON_HOC        AS "maMonHoc",
               TKB.BAC_DAO_TAO       AS "bacDaoTao",
               TKB.LOAI_HINH_DAO_TAO AS "loaiHinhDaoTao",
               TKB.NHOM              AS "nhom"
        from DT_THOI_KHOA_BIEU TKB
                 LEFT JOIN DT_THOI_KHOA_BIEU_NGANH TKBN ON TKB.ID = TKBN.ID_THOI_KHOA_BIEU
        WHERE TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy;
    return my_cursor;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor            SYS_REFCURSOR;
    sT                   STRING(502) := '%' || lower(searchTerm) || '%';
    donVi                STRING(10);
    idNamDaoTao          STRING(10);
    hocKy                STRING(1);
    bacDaoTaoFilter      STRING(10);
    loaiHinhDaoTaoFilter STRING(10);
    phongFilter          STRING(10);
    thuFilter            STRING(2);
    giangVienFilter      STRING(10);
    monHocFilter         STRING(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.idNamDaoTao') INTO idNamDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTaoFilter') INTO bacDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTaoFilter') INTO loaiHinhDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phongFilter') INTO phongFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.giangVienFilter') INTO giangVienFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.monHocFilter') INTO monHocFilter FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
             LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
             LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
--              LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
                                    TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
    WHERE (TGMM.KICH_HOAT = 1)
      AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
      AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
      AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
      AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
      AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
           loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
      AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
      AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
      AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
      AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
      AND (searchTerm = ''
        OR LOWER(TRIM(DMMH.TEN)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN thoiGianPhanCong FOR
        SELECT *
        FROM (SELECT TGPC.BAT_DAU                         AS "batDau",
                     TGPC.KET_THUC                        AS "ketThuc",
                     TGPC.DON_VI                          AS "donVi",
                     DV.TEN                               AS "tenDonVi",
                     CTKDT.NAM_DAO_TAO                    AS "namDaoTao",
                     TGPC.HOC_KY                          AS "hocKy",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA)     AS "tongSoLop",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA
                        AND (TKB.GIANG_VIEN IS NOT NULL)) AS "daPhanCong"

              FROM DT_THOI_GIAN_PHAN_CONG TGPC
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TGPC.NAM
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                       LEFT JOIN DM_DON_VI DV ON DV.MA = TGPC.DON_VI
              WHERE (donVi IS NULL OR donVi = '' OR donVi = TGPC.DON_VI));

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID                AS             "id",
                     TKB.PHONG             AS             "phong",
                     TKB.THU               AS             "thu",
                     TKB.TIET_BAT_DAU      AS             "tietBatDau",
                     TKB.SO_TIET_BUOI      AS             "soTiet",
                     TKB.HOC_KY            AS             "hocKy",
                     TKB.NAM               AS             "nam",
                     TKB.MA_MON_HOC        AS             "maMonHoc",
                     TKB.NGAY_BAT_DAU      AS             "ngayBatDau",
                     TKB.NGAY_KET_THUC     AS             "ngayKetThuc",
                     TKB.LOAI_MON_HOC      AS             "loaiMonHoc",
                     TKB.NHOM              AS             "nhom",
                     TKB.SO_LUONG_DU_KIEN  AS             "soLuongDuKien",
                     DV.TEN                AS             "tenKhoaBoMon",
                     DV.MA                 AS             "maKhoaBoMon",
                     DMMH.TEN              AS             "tenMonHoc",
                     DMMH.TONG_TIET        AS             "tongTiet",
                     TKB.KHOA_DANG_KY      AS             "khoaDangKy",
                     DV1.TEN               AS             "tenKhoaDangKy",
                     CB.HO                 AS             "hoGiangVien",
                     CB.TEN                AS             "tenGiangVien",
                     TKB.GIANG_VIEN        as             "giangVien",
                     TD.VIET_TAT           AS             "trinhDo",
                     TKB.SUC_CHUA          AS             "sucChua",
--                      NDT.TEN_NGANH         AS             "tenNganh",
                     TKB.BUOI              AS             "buoi",
                     TKB.IS_MO             AS             "isMo",
                     CTKDT.NAM_DAO_TAO     AS             "namDaoTao",
                     TKB.BAC_DAO_TAO       AS             "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO AS             "loaiHinhDaoTao",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
--                        LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM
                                 ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
                                    TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
              WHERE (TGMM.KICH_HOAT = 1)
                AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
                AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
                AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
                AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
                AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
                     loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
                AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
                AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
                AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
                AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
                AND (searchTerm = ''
                  OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT)
              ORDER BY TKB.THU, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_DASHBOARD_GET_DATA(
    time IN NUMBER,
    HCTH_CONG_VAN_DEN OUT SYS_REFCURSOR,
    HCTH_CONG_VAN_DI OUT SYS_REFCURSOR,
    VAN_BAN_DEN_NAM OUT SYS_REFCURSOR,
    VAN_BAN_DI_NAM OUT SYS_REFCURSOR
) RETURN SYS_REFCURSOR
AS
    DATA_VB SYS_REFCURSOR;
    today   NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN HCTH_CONG_VAN_DEN FOR
        SELECT COUNT(*) AS "tongVanBanDen"

        FROM HCTH_CONG_VAN_DEN cvden
        WHERE cvden.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvden.NGAY_NHAN >= time));

    OPEN HCTH_CONG_VAN_DI FOR
        SELECT COUNT(*) AS "tongVanBanDi"
        FROM HCTH_CONG_VAN_DI cvdi
        WHERE cvdi.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvdi.NGAY_TAO >= time));

    OPEN VAN_BAN_DEN_NAM FOR
        SELECT *
        FROM HCTH_CONG_VAN_DEN cvden
        WHERE cvden.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvden.NGAY_NHAN >= time));

    OPEN VAN_BAN_DI_NAM FOR
        SELECT *
        FROM HCTH_CONG_VAN_DI cvdi
        WHERE cvdi.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvdi.NGAY_TAO >= time));

    OPEN DATA_VB FOR
        select "numOfDocument",
               "maDonVi",
               "numOfDen",
               "numOfDi",
               dv.TEN          as "tenDonVi",
               dv.TEN_VIET_TAT as "tenVietTat"
        from (
                 SELECT COUNT(dvn.ID)   as "numOfDocument",
                        dvn.DON_VI_NHAN as "maDonVi",
                        COUNT(case when dvn.LOAI = 'DI' then 1 END) as "numOfDi",
                        COUNT(case when dvn.LOAI = 'DEN' then 1 end) as "numOfDen"
                 FROM HCTH_DON_VI_NHAN dvn
                          left join HCTH_CONG_VAN_DEN cvden on (dvn.MA = cvden.ID AND dvn.LOAI = 'DEN')
                          LEFT JOIN HCTH_CONG_VAN_DI cvdi on (dvn.MA = cvdi.ID AND dvn.LOAI = 'DI')
                 WHERE dvn.DON_VI_NHAN_NGOAI = 0
                   AND (
                         ((cvden.NGAY_NHAN >= time) AND (dvn.LOAI = 'DEN'))
                         OR ((cvdi.NGAY_TAO >= time) AND (dvn.LOAI = 'DI'))
                       OR (time IS NULL AND(dvn.LOAI = 'DEN' OR dvn.LOAI = 'DI'))
                     )
                 group by dvn.DON_VI_NHAN
                 ORDER BY dvn.DON_VI_NHAN asc
             )
                 LEFT JOIN DM_DON_VI dv on "maDonVi" = dv.MA;

    RETURN DATA_VB;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_HO_SO_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam IN STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_HO_SO hs;
    --     WHERE (
--
--               )
    IF pageNumber < 1 THEN
        pageNumber := 1;
    end if;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hs.ID        AS                         "id",
                     hs.NGUOI_TAO AS                         "nguoiTao",
                     hs.TIEU_DE   AS                         "tieuDe",
--                      hs.VAN_BAN   AS                         "vanBan",
                     cbt.HO       AS                         "hoNguoiTao",
                     cbt.TEN      AS                         "tenNguoiTao",

                     ROW_NUMBER() over (ORDER BY hs.ID DESC) R

              FROM HCTH_HO_SO hs
                       LEFT JOIN TCHC_CAN_BO cbt ON cbt.SHCC = hs.NGUOI_TAO
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       namHoc IN NUMBER, hocKy IN NUMBER, loaiPhi IN STRING,
                                       loaiDaoTao IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TC_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM TC_DINH_MUC_HOC_PHI TCDM
        LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
        LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LDT ON LDT.MA = TCDM.LOAI_DAO_TAO
    WHERE (
            searchTerm = ''
            OR NAM_HOC LIKE sT
            OR lower(TCLP.TEN) LIKE sT
        ) AND
        (
            (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
            AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
            AND (loaiDaoTao IS NOT NULL AND TCDM.LOAI_DAO_TAO = loaiDaoTao OR loaiDaoTao IS NULl)
        );
  RETURN NULL;
END TC_DINH_MUC_HOC_PHI_SEARCH_PAGE;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    namHoc    NUMBER(4); listBacDaoTao NVARCHAR2(200);
    hocKy     NUMBER(1); listLoaiHinhDaoTao NVARCHAR2(200);
    daDong    NUMBER(1); listKhoa NVARCHAR2(500);
    listNganh NVARCHAR2(500);
    tuNgay    NUMBER(20);
    denNgay   NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     FS.HO                    as         "ho",
                     FS.TEN                   AS         "ten",
                     FS.GIOI_TINH             AS         "gioiTinh",
                     FS.NGAY_SINH             AS         "ngaySinh",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     FS.DIEN_THOAI_CA_NHAN    AS         "soDienThoai",
                     FS.EMAIL_CA_NHAN         AS         "emailCaNhan",
                     FS.MA_NGANH              AS         "maNganh",
                     NDT.TEN_NGANH            AS         "tenNganh",
                     DV.TEN                   AS         "tenKhoa",
                     LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC              AS         "tenBacDaoTao",
                     THPT.TRANS_ID            AS         "lastTransactionId",
                     THPT.TRANS_DATE          AS         "lastTransaction",
                     HPI.ID                   AS         "invoiceId",

                     ROW_NUMBER() OVER (ORDER BY FS.TEN, FS.HO, FS.MSSV) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS
                                 on HP.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                       LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                                 on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and HP.HOC_KY = HPI.HOC_KY
                       LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                  AND HP.NAM_HOC = THPT.NAM_HOC
                  AND HP.MSSV = THPT.CUSTOMER_ID
                  AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                         FROM TC_HOC_PHI_TRANSACTION TRANS
                                         WHERE HP.HOC_KY = TRANS.HOC_KY
                                           AND HP.NAM_HOC = TRANS.NAM_HOC
                                           AND HP.MSSV = TRANS.CUSTOMER_ID)
              WHERE  (
                      daDong IS NULL
                      OR daDong = ''
                      OR daDong = 1
                          AND HP.CONG_NO = 0
                      OR daDong = 0
                          AND HP.CONG_NO != 0
                  )
                AND (listNganh IS NULL
                  OR
                     listNganh IS NOT NULL
                         AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh
                                                        , '[^,]+'
                                                        , 1
                                                        , level)
                                             from dual
                                             connect by regexp_substr(listNganh
                                                            , '[^,]+'
                                                            , 1
                                                            , level) is not null))
                AND (listKhoa IS NULL
                  OR
                     listKhoa IS NOT NULL
                         AND FS.KHOA IN (SELECT regexp_substr(listKhoa
                                                    , '[^,]+'
                                                    , 1
                                                    , level)
                                         from dual
                                         connect by regexp_substr(listKhoa
                                                        , '[^,]+'
                                                        , 1
                                                        , level) is not null))
                AND (listBacDaoTao IS NULL
                  OR
                     listBacDaoTao IS NOT NULL
                         AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao
                                                   , '[^,]+'
                                                   , 1
                                                   , level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao
                                                       , '[^,]+'
                                                       , 1
                                                       , level) is not null))
                AND (listLoaiHinhDaoTao IS NULL
                  OR
                     listLoaiHinhDaoTao IS NOT NULL
                         AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao
                                                         , '[^,]+'
                                                         , 1
                                                         , level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao
                                                             , '[^,]+'
                                                             , 1
                                                             , level) is not null))
                AND (HP.NAM_HOC = namHoc
                  AND HP.HOC_KY = hocKy)

                and ((tuNgay is null and denNgay is null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  )
              ORDER BY HP.MSSV
              );
    RETURN my_cursor;
END ;

/
--EndMethod--

