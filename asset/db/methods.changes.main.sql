CREATE OR REPLACE FUNCTION HCTH_LIEN_KET_GET_ALL_FROM(
    targetA IN NUMBER,
    targetTypeA IN NVARCHAR2,
    targetB IN NUMBER,
    targetTypeB IN NVARCHAR2
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT lk.ID                   as "id",
               lk.LOAI_A               as "loaiA",
               lk.KEY_A                as "keyA",
               lk.LOAI_B               as "loaiB",
               lk.KEY_B                as "keyB",
               hcthcvden.TRICH_YEU     as "trichYeuDen",
               hcthcvden.SO_CONG_VAN   as "soCongVanDen",
               hcthcvden.NGAY_NHAN     as "ngayNhan",
               hcthcvden.NGAY_CONG_VAN as "ngayCongVan",
               hcthcvden.SO_DEN        as "soDen",

               hcthcvdi.NGAY_TAO       AS "ngayTaoDi",
               hcthcvdi.TRICH_YEU      as "trichYeuDi"
        FROM HCTH_LIEN_KET lk
                 LEFT JOIN HCTH_CONG_VAN_DEN hcthcvden ON hcthcvden.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DEN'
                 LEFT JOIN HCTH_CONG_VAN_DI hcthcvdi
                           ON hcthcvdi.ID = lk.KEY_B and (lk.LOAI_B = 'CONG_VAN_DI' OR lk.LOAI_B = 'VAN_BAN_DI')
        WHERE (targetA is null or lk.KEY_A = targetA)
          and (targetTypeA is null or lk.LOAI_A = targetTypeA)
          and (targetB is null or lk.KEY_B = targetB)
          and (targetTypeB is null or lk.LOAI_B = targetTypeB);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       namBatDau IN NUMBER, namKetThuc IN NUMBER, hocKy IN NUMBER,
                                       loaiPhi IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TC_INFO SYS_REFCURSOR;
    sT           STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT DISTINCT NAM_BAT_DAU, NAM_KET_THUC, HOC_KY, LOAI_PHI FROM TC_DINH_MUC_HOC_PHI) TCDM
        LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
    WHERE (
            searchTerm = ''
            OR lower(TCLP.TEN) LIKE sT
        ) AND
        (
            (namBatDau IS NOT NULL AND TCDM.NAM_BAT_DAU = namBatDau OR namBatDau IS NULL)
            AND (namKetThuc IS NOT NULL AND TCDM.NAM_KET_THUC = namKetThuc OR namKetThuc IS NULL)
            AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
            AND (loaiPhi IS NOT NULL AND TCDM.LOAI_PHI = loaiPhi OR loaiPhi IS NULL)
        ) AND TCLP.KICH_HOAT = 1;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TC_INFO FOR
        SELECT *
        FROM (
            SELECT
                TCDM.HOC_KY                                         AS "hocKy",
                TCDM.LOAI_PHI                                       AS "loaiPhi",
                TCLP.TEN                                            AS "tenLoaiPhi",
                TCDM.NAM_BAT_DAU                                    AS "namBatDau",
                TCDM.NAM_KET_THUC                                   AS "namKetThuc",
                TCDM.SO_TIEN_MAC_DINH                               AS "soTienMacDinh",
                ROW_NUMBER() OVER (ORDER BY TCDM.NAM_BAT_DAU DESC NULLS LAST, TCDM.HOC_KY, TCDM.LOAI_PHI) R
            FROM (SELECT DISTINCT NAM_BAT_DAU, NAM_KET_THUC, HOC_KY, LOAI_PHI, SO_TIEN_MAC_DINH FROM TC_DINH_MUC_HOC_PHI) TCDM
                LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
            WHERE (
                    searchTerm = ''
                    OR lower(TCLP.TEN) LIKE sT
                ) AND
                (
                    (namBatDau IS NOT NULL AND TCDM.NAM_BAT_DAU = namBatDau OR namBatDau IS NULL)
                    AND (namKetThuc IS NOT NULL AND TCDM.NAM_KET_THUC = namKetThuc OR namKetThuc IS NULL)
                    AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
                    AND (loaiPhi IS NOT NULL AND TCDM.LOAI_PHI = loaiPhi OR loaiPhi IS NULL)
                ) AND TCLP.KICH_HOAT = 1
        ) WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
  RETURN TC_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_STATISTIC(filter IN STRING, transactions OUT SYS_REFCURSOR, invoice OUT SYS_REFCURSOR
) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    namHoc             NUMBER(4);
    hocKy              NUMBER(1);
    tuNgay             NUMBER(20);
    denNgay            NUMBER(20);
    listBacDaoTao      NVARCHAR2(200);
    listLoaiHinhDaoTao NVARCHAR2(200);
    listKhoa           NVARCHAR2(500);
    listNganh          NVARCHAR2(500);
    nganHang           NVARCHAR2(500);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganHang') INTO nganHang FROM DUAL;

    OPEN transactions FOR
        SELECT FS.MSSV                      AS "mssv",
               FS.HO                        AS "ho",
               FS.TEN                       AS "ten",
               THPT.HOC_KY                  AS "hocKy",
               THPT.BANK                    as "nganHang",
               THPT.NAM_HOC                 AS "namHoc",
               THPT.AMOUNT                  AS "khoanDong",
               FS.MA_NGANH                  AS "maNganh",
               BDT.MA_BAC                   AS "bacDaoTao",
               NDT.TEN_NGANH                AS "tenNganh",
               DV.TEN                       AS "tenKhoa",
               LHDT.TEN                     AS "tenLoaiHinhDaoTao",
               BDT.TEN_BAC                  AS "tenBacDaoTao",
               THPT.TRANS_DATE              AS "ngayDong",
               THPT.STATUS                  AS "trangThai",
--                THPTI.INVOICE_TRANSACTION_ID AS "invoiceTransactonId",
--                THPTI.INVOICE_NUMBER         AS "invoiceNumber",
--                THPTI.ID                     AS "invoiceID",
               THPT.TRANS_ID                AS "transactionId"
        FROM TC_HOC_PHI_TRANSACTION THPT
                 LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
--                  LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE THPTI on THPT.TRANS_ID = THPTI.TRANSACTION_ID
        where THPT.NAM_HOC = namHoc
          and THPT.HOC_KY = hocKy
          and ((tuNgay is null and denNgay is null) or
               (
                           IS_NUMERIC(THPT.TRANS_DATE) = 1
                       and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                       and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                   )
            )
          and THPT.STATUS = 1
          AND (listBacDaoTao IS NULL OR
               listBacDaoTao IS NOT NULL AND
               FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
          AND (listNganh IS NULL OR
               listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
          AND (listKhoa IS NULL OR
               listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
          AND (listLoaiHinhDaoTao IS NULL OR
               listLoaiHinhDaoTao IS NOT NULL AND
               FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
          AND (nganHang IS NULL OR
               THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                             from dual
                             connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null));

    OPEN invoice FOR
        SELECT HPTI.NGAY_PHAT_HANH      AS        "ngayPhatHanh",
               HPTI.LY_DO_HUY           AS        "lydoHuy"
        FROM TC_HOC_PHI_TRANSACTION_INVOICE HPTI;


    OPEN my_cursor FOR
        SELECT HP.MSSV                  AS         "mssv",
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
               BDT.MA_BAC               AS         "bacDaoTao",
               LHDT.MA                  AS         "loaiHinhDaoTao",
               NDT.TEN_NGANH            AS         "tenNganh",
               DV.TEN                   AS         "tenKhoa",
               LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
               BDT.TEN_BAC              AS         "tenBacDaoTao",
               THPT.TRANS_ID            AS         "lastTransactionId",
               THPT.TRANS_DATE          AS         "lastTransaction",
               HPI.ID                   AS         "invoiceId",
               ROW_NUMBER() OVER (ORDER BY FS.TEN) R
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
        WHERE (listNganh IS NULL
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
            );
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
    FROM HCTH_HO_SO hs
    WHERE (
              (
                          ST = ''
                      OR LOWER(hs.TIEU_DE) LIKE ST
                  )
              );
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
              WHERE (
                        (
                                    ST = ''
                                OR LOWER(hs.TIEU_DE) LIKE ST
                            )
                        )
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

